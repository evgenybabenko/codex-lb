from __future__ import annotations

import base64
import json
import re
import subprocess
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


UPSTREAM = "Soju06:main"
OUR_VARIANT = "evgenybabenko:develop"
SNAPSHOT_DATE = "2026-04-08"

SKIP_BRANCH_PREFIXES = (
    "all-contributors/",
    "release-please--branches--",
    "backup/",
    "archive/",
)
SKIP_BRANCH_EXACT = {
    "main",
    "master",
    "develop",
    "release-please--branches--main",
    "patch-1",
    "claude",
}

TOPIC_RULES = [
    (
        "translation",
        "Локализация интерфейса",
        ["translate", "translation", "i18n", "polish", "korean", "cn", "ui strings"],
        [],
    ),
    (
        "helm",
        "Helm и деплой",
        [
            "helm",
            "servicemonitor",
            "external database",
            "nodeselector",
            "db-init",
            "production deployment",
            "service links",
        ],
        ["deploy/helm", "docker-compose", "README.md"],
    ),
    (
        "dashboard",
        "Dashboard и UX",
        ["dashboard", "donut", "timeframe", "overview", "ui toggle", "frontend rework", "label colors"],
        ["frontend/src/features/dashboard", "frontend/src/components", "app/modules/dashboard"],
    ),
    (
        "usage",
        "Usage, квоты и тарификация",
        ["usage", "quota", "credit", "depletion", "service tier", "cache tokens", "reasoning effort", "burnrate"],
        ["app/modules/usage", "app/modules/api_keys", "frontend/src/features/dashboard"],
    ),
    (
        "auth",
        "Аутентификация и доступ",
        ["oauth", "totp", "auth", "api key", "rbac", "proxy-auth", "admin token", "remote auth"],
        ["app/core/auth", "app/modules/oauth", "app/modules/admin_auth", "app/modules/api_keys"],
    ),
    (
        "routing",
        "Маршрутизация, sticky sessions и failover",
        ["sticky", "failover", "soft drain", "round-robin", "previous response", "bridge", "owner policy"],
        ["app/core/balancer", "app/modules/proxy", "app/core/clients", "app/core/middleware"],
    ),
    (
        "compat",
        "Совместимость с клиентами и API",
        ["responses", "chat completion", "opencode", "openclaw", "transcription", "v1", "protocol compat"],
        ["app/modules/chat_completions", "app/modules/audio", "app/modules/proxy", "frontend/src"],
    ),
    (
        "logs",
        "Логи и наблюдаемость",
        ["request log", "error details", "visibility", "observability"],
        ["app/modules/request_logs", "app/core/metrics", "frontend/src/features/request-logs"],
    ),
    (
        "ci",
        "CI, workflows и платформенная поддержка",
        ["ci", "workflow", "windows", "startup", "trivy", "actions", "lint"],
        [".github/workflows", ".pre-commit-config.yaml"],
    ),
    (
        "accounts",
        "Аккаунты и админские операции",
        ["account", "org label", "batch auth", "import", "export", "refreshable browser", "multi-account"],
        ["app/modules/accounts", "frontend/src/features/accounts", "app/modules/admin_accounts"],
    ),
    (
        "db",
        "База данных и storage",
        ["postgres", "neon", "database", "migration"],
        ["app/db", "alembic", "deploy/helm"],
    ),
    (
        "docs",
        "Документация и onboarding",
        ["docs", "readme", "guide", "example"],
        ["README.md", "docs/", "openspec/"],
    ),
]

RATING_ORDER = {"High": 0, "Medium": 1, "Low": 2, "None": 3}


@dataclass
class BranchSummary:
    name: str
    compare: dict
    summary: str
    areas: list[tuple[str, int]]
    subjects: list[str]


def gh_api(path: str) -> tuple[dict | list | None, str | None]:
    proc = subprocess.run(["gh", "api", path], capture_output=True, text=True)
    if proc.returncode != 0:
        message = proc.stderr.strip() or proc.stdout.strip() or f"gh api failed for {path}"
        return None, message
    return json.loads(proc.stdout), None


def paginate(path_template: str) -> list[dict]:
    items: list[dict] = []
    page = 1
    while True:
        data, err = gh_api(path_template.format(page=page))
        if err:
            raise RuntimeError(err)
        assert isinstance(data, list)
        if not data:
            break
        items.extend(data)
        if len(data) < 100:
            break
        page += 1
    return items


def compare(base: str, head: str) -> dict:
    data, err = gh_api(f"repos/Soju06/codex-lb/compare/{base}...{head}")
    if err:
        return {"error": True, "error_message": err, "base": base, "head": head}
    assert isinstance(data, dict)
    data["error"] = False
    data["base"] = base
    data["head"] = head
    return data


def get_repo_file(full_name: str, path: str, ref: str) -> str | None:
    data, err = gh_api(f"repos/{full_name}/contents/{path}?ref={ref}")
    if err or not isinstance(data, dict):
        return None
    content = data.get("content")
    if content and data.get("encoding") == "base64":
        return base64.b64decode(content).decode("utf-8", errors="replace")
    return None


def slugify(name: str) -> str:
    return name.replace("/", "__")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + "\n", encoding="utf-8")


def clean_subject(subject: str) -> str:
    subject = re.sub(r"\s+\(#\d+\)$", "", subject).strip()
    subject = re.sub(r"^Merge pull request #[0-9]+ from .+$", "", subject).strip()
    subject = re.sub(r"^Merge branch '.+'(?: of .+)?$", "", subject).strip()
    subject = re.sub(r"^[a-zA-Z0-9_./-]+(?:\([^)]+\))?!?:\s*", "", subject).strip()
    return subject


def subject_list(compare_data: dict) -> list[str]:
    items: list[str] = []
    for commit in compare_data.get("commits", []):
        message = commit.get("commit", {}).get("message", "")
        first_line = message.split("\n", 1)[0].strip()
        if first_line:
            items.append(first_line)
    return items


def unique_cleaned_subjects(compare_data: dict, limit: int = 8) -> list[str]:
    cleaned: list[str] = []
    seen: set[str] = set()
    for raw in subject_list(compare_data):
        subject = clean_subject(raw)
        if not subject or subject.lower().startswith("merge "):
            continue
        key = subject.lower()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(subject)
        if len(cleaned) >= limit:
            break
    return cleaned


def files_list(compare_data: dict) -> list[dict]:
    return compare_data.get("files") or []


def file_names(compare_data: dict) -> list[str]:
    return [item["filename"] for item in files_list(compare_data) if item.get("filename")]


def area_for_file(path: str) -> str:
    if path.startswith("frontend/src/features/dashboard/"):
        return "frontend/dashboard"
    if path.startswith("frontend/src/features/accounts/"):
        return "frontend/accounts"
    if path.startswith("frontend/src/features/request-logs/"):
        return "frontend/request-logs"
    if path.startswith("frontend/src/"):
        return "frontend/src"
    if path.startswith("deploy/helm/"):
        return "deploy/helm"
    if path.startswith("app/modules/"):
        return "/".join(path.split("/")[:3])
    if path.startswith("app/core/"):
        return "/".join(path.split("/")[:3])
    if path.startswith("app/db/"):
        return "app/db"
    if path.startswith("tests/"):
        return "/".join(path.split("/")[:2])
    if path.startswith("docs/"):
        return "docs"
    if path.startswith("openspec/"):
        return "openspec"
    if path.startswith(".github/workflows/"):
        return ".github/workflows"
    return path.split("/", 1)[0] if "/" in path else path


def top_areas(compare_data: dict, limit: int = 6) -> list[tuple[str, int]]:
    counter = Counter(area_for_file(path) for path in file_names(compare_data))
    return counter.most_common(limit)


def has_substantive_code(compare_data: dict) -> bool:
    for path in file_names(compare_data):
        if path.startswith(("app/", "frontend/src/", "deploy/helm/")):
            return True
    return False


def is_docs_only(compare_data: dict) -> bool:
    names = file_names(compare_data)
    if not names:
        return False
    for path in names:
        if path == "README.md":
            continue
        if path in {".all-contributorsrc", "CHANGELOG.md"}:
            continue
        if path.startswith(("docs/", "openspec/", ".github/")):
            continue
        return False
    return True


def matches_topic(rule: tuple[str, str, list[str], list[str]], branch_name: str, compare_data: dict) -> list[str]:
    _, _, commit_keywords, file_keywords = rule
    subjects = " ".join(unique_cleaned_subjects(compare_data, limit=20)).lower()
    branch_lower = branch_name.lower()
    files = " ".join(file_names(compare_data)).lower()

    evidence: list[str] = []
    for keyword in commit_keywords:
        lower = keyword.lower()
        if lower in subjects or lower in branch_lower:
            evidence.append(keyword)
    for keyword in file_keywords:
        lower = keyword.lower()
        if lower in files:
            evidence.append(keyword)
    return evidence


def build_topic_summaries(branch_name: str, compare_data: dict) -> list[str]:
    cleaned = unique_cleaned_subjects(compare_data, limit=12)
    rendered: list[str] = []
    seen: set[str] = set()

    for rule in TOPIC_RULES:
        key, label, _, _ = rule
        evidence = matches_topic(rule, branch_name, compare_data)
        if not evidence or key in seen:
            continue

        related = [
            subject
            for subject in cleaned
            if any(item.lower() in subject.lower() for item in evidence)
        ]
        if not related:
            related = cleaned[:2]

        if related:
            rendered.append(f"- {label}: {'; '.join(related[:3])}.")
            seen.add(key)

    if not rendered and cleaned:
        rendered.append(f"- Уникальная доработка без явного ярлыка: {'; '.join(cleaned[:3])}.")

    return rendered[:4]


def compare_status_line(compare_data: dict) -> str:
    if compare_data.get("error"):
        message = compare_data.get("error_message", "compare failed")
        if "No common ancestor" in message:
            return "история разошлась настолько, что GitHub не видит общего предка"
        return f"не удалось сравнить автоматически: {message}"
    return (
        f"{compare_data.get('status', 'unknown')}, "
        f"ahead {compare_data.get('ahead_by', 0)}, "
        f"behind {compare_data.get('behind_by', 0)}"
    )


def recommendation(default_cmp: dict, extra_branch_summaries: list[BranchSummary]) -> tuple[str, str]:
    if default_cmp.get("error"):
        if "No common ancestor" in default_cmp.get("error_message", ""):
            return (
                "Medium",
                "Похоже на отдельную реализацию или серьёзный rewrite. Полезно как источник идей, но не как прямой cherry-pick.",
            )
        return ("Low", "Автоматически сравнить не удалось; нужен отдельный ручной разбор, если fork действительно интересен.")

    if default_cmp.get("ahead_by", 0) == 0 and not extra_branch_summaries:
        return ("None", "Уникального кода относительно upstream не найдено.")

    if is_docs_only(default_cmp) and not any(
        has_substantive_code(item.compare) for item in extra_branch_summaries if not item.compare.get("error")
    ):
        return ("Low", "Изменения в основном документационные или сервисные.")

    topic_text = " ".join(build_topic_summaries("default", default_cmp)).lower()
    if "локализация интерфейса" in topic_text and not has_substantive_code(default_cmp):
        return ("Low", "Это в первую очередь локализация/кастомизация интерфейса, а не новая продуктовая логика.")

    substantive_default = has_substantive_code(default_cmp)
    substantive_extra = any(has_substantive_code(item.compare) for item in extra_branch_summaries if not item.compare.get("error"))
    big_default = default_cmp.get("ahead_by", 0) >= 4
    big_branch = any(item.compare.get("ahead_by", 0) >= 3 for item in extra_branch_summaries if not item.compare.get("error"))

    if substantive_default or substantive_extra:
        if big_default or big_branch:
            return ("High", "Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.")
        return ("Medium", "Есть полезные идеи, но переносить стоит точечно после ручной валидации.")

    return ("Low", "Есть уникальные ветки или мелкие правки, но явной высокой ценности для вашей ветки не видно.")


def branch_should_be_checked(branch_name: str, branch_sha: str, default_sha: str | None) -> bool:
    if branch_name in SKIP_BRANCH_EXACT:
        return False
    if any(branch_name.startswith(prefix) for prefix in SKIP_BRANCH_PREFIXES):
        return False
    if default_sha and branch_sha == default_sha:
        return False
    return True


def summarize_branch(branch_name: str, compare_data: dict) -> str:
    if compare_data.get("error"):
        message = compare_data.get("error_message", "compare failed")
        if "No common ancestor" in message:
            return f"- `{branch_name}`: GitHub не находит общего предка с upstream; это похоже на отдельную линию разработки или rewrite."
        return f"- `{branch_name}`: автоматическое сравнение не удалось ({message})."

    subjects = unique_cleaned_subjects(compare_data, limit=3)
    if subjects:
        return (
            f"- `{branch_name}`: ahead {compare_data.get('ahead_by', 0)}, "
            f"behind {compare_data.get('behind_by', 0)}. "
            f"По коммитам видно: {'; '.join(subjects)}."
        )
    return f"- `{branch_name}`: ahead {compare_data.get('ahead_by', 0)}, behind {compare_data.get('behind_by', 0)}."


def report_link(full_name: str) -> str:
    return f"./reports/{slugify(full_name)}.md"


def markdown_list(items: list[str], indent: str = "- ") -> list[str]:
    return [f"{indent}{item}" for item in items]


def strip_bullet_prefix(text: str) -> str:
    return text[2:].rstrip(".") if text.startswith("- ") else text.rstrip(".")


def build_checklist_summary(
    full_name: str,
    repo: str,
    default_cmp: dict,
    extra_branch_summaries: list[BranchSummary],
    default_topics: list[str],
    default_subjects: list[str],
    recommendation_text: str,
) -> str:
    if default_cmp.get("error"):
        message = default_cmp.get("error_message", "")
        repo_lower = repo.lower()
        if "No common ancestor" in message:
            if repo_lower == "codex-lb-ts" or repo_lower.endswith("-ts") or "/codex-lb-ts" in full_name.lower():
                return "Это отдельный TypeScript-порт проекта. Для быстрого переноса фич почти не годится, но может быть полезен как источник идей."
            return "История форка сильно оторвана от upstream. Это скорее отдельная линия развития, чем обычный набор патчей поверх основного проекта."
        return "GitHub не дал нормальное автоматическое сравнение. Если захотим что-то тянуть отсюда, нужен отдельный ручной разбор."

    if default_cmp.get("ahead_by", 0) == 0:
        if extra_branch_summaries:
            for branch in extra_branch_summaries:
                if branch.subjects:
                    return (
                        "На основной ветке почти ничего нет, но в отдельных feature-ветках лежат идеи вроде: "
                        + "; ".join(branch.subjects[:2])
                        + "."
                    )
            return "На основной ветке своих фич почти нет, но внутри форка есть отдельные feature-ветки с полезной работой."
        return "По сути это копия upstream без своих заметных отличий."

    if default_topics:
        return "Главное, что тут выделяется: " + "; ".join(strip_bullet_prefix(item) for item in default_topics[:2]) + "."

    if default_subjects:
        return "По уникальным коммитам видно: " + "; ".join(default_subjects[:2]) + "."

    for branch in extra_branch_summaries:
        if branch.subjects:
            return "Главная ценность сидит в отдельных ветках: " + "; ".join(branch.subjects[:2]) + "."

    return recommendation_text


def should_borrow_from_fork(
    repo: str,
    rating: str,
    default_cmp: dict,
    extra_branch_summaries: list[BranchSummary],
    default_topics: list[str],
    default_subjects: list[str],
) -> bool:
    if rating in {"None", "Low"}:
        return False

    repo_lower = repo.lower()
    text_parts = list(default_subjects)
    text_parts.extend(strip_bullet_prefix(item) for item in default_topics)
    for branch in extra_branch_summaries[:4]:
        text_parts.extend(branch.subjects[:3])
    combined = " ".join(text_parts).lower()

    negative_keywords = [
        "translate",
        "translation",
        "polish",
        "korean",
        "cn",
        "readme",
        "docs",
        "workflow",
        "windows startup",
        "unit test",
        "archive active changes",
        "fixture",
        "typescript",
        "rewrite",
    ]
    positive_keywords = [
        "dashboard",
        "usage",
        "quota",
        "credit",
        "api key",
        "rbac",
        "sticky",
        "failover",
        "fallback",
        "previous response",
        "bridge",
        "responses",
        "transcription",
        "request visibility",
        "error details",
        "platform fallback",
        "oauth",
        "batch auth",
        "import",
        "export",
        "neon",
        "postgres",
        "admin token",
        "portal",
        "viewer",
    ]

    if repo_lower == "codex-lb-ts" or repo_lower.endswith("-ts"):
        return False
    if any(keyword in combined for keyword in negative_keywords):
        return False
    if any(keyword in combined for keyword in positive_keywords):
        return True
    if default_cmp.get("error"):
        return False
    return rating == "High" and (
        has_substantive_code(default_cmp)
        or any(has_substantive_code(item.compare) for item in extra_branch_summaries if not item.compare.get("error"))
    )


def already_in_our_variant(ours_cmp: dict, extra_branch_summaries: list[BranchSummary]) -> bool:
    if ours_cmp.get("error"):
        return False
    return ours_cmp.get("ahead_by", 0) == 0 and not extra_branch_summaries


def main() -> None:
    root = Path.cwd()
    out_dir = root / "research" / "forks" / SNAPSHOT_DATE
    reports_dir = out_dir / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    snapshot_iso = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    forks = paginate("repos/Soju06/codex-lb/forks?per_page=100&page={page}&sort=newest")
    print(f"Fetched {len(forks)} accessible forks")

    status_out = subprocess.check_output(["git", "status", "--short"], cwd=root, text=True)
    head_sha = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()

    ours_vs_upstream = compare(UPSTREAM, OUR_VARIANT)
    our_subjects = unique_cleaned_subjects(ours_vs_upstream, limit=12)
    baseline_lines = [
        "# База сравнения: evgenybabenko/develop",
        "",
        f"- Снимок: `{SNAPSHOT_DATE}` (`{snapshot_iso}` UTC)",
        f"- Локальная ветка: `develop` на `{head_sha[:7]}`",
        f"- Публичная база сравнения: `{OUR_VARIANT}`",
        f"- Upstream: `{UPSTREAM}`",
        "- Незакоммиченные локальные изменения в рабочем дереве намеренно не включены в сравнение с форками, чтобы отчёты были воспроизводимыми.",
        "",
        "## Что уже есть в нашем варианте поверх upstream",
        "",
        f"- Статус относительно upstream: {compare_status_line(ours_vs_upstream)}.",
    ]
    if our_subjects:
        baseline_lines.append("- Наши уникальные коммиты:")
        baseline_lines.extend(markdown_list(our_subjects, indent="  - "))
    areas = top_areas(ours_vs_upstream)
    if areas:
        baseline_lines.extend(["", "## Основные зоны наших изменений", ""])
        baseline_lines.extend([f"- `{area}`: {count} файлов" for area, count in areas])
    if status_out.strip():
        baseline_lines.extend(["", "## Локальные незакоммиченные изменения", ""])
        baseline_lines.extend([f"- `{line}`" for line in status_out.strip().splitlines()])
    write_text(out_dir / "baseline-evgenybabenko-develop.md", "\n".join(baseline_lines))

    reports_index: list[dict] = []
    catalog_rows: list[tuple[str, int, str, int, str]] = []
    fork_checklist_rows: list[dict] = []

    for idx, fork in enumerate(forks, start=1):
        full_name = fork["full_name"]
        owner = fork["owner"]["login"]
        repo = fork["name"]
        default_branch = fork["default_branch"]
        print(f"[{idx:03}/{len(forks)}] {full_name}")

        default_cmp = compare(UPSTREAM, f"{owner}:{default_branch}")
        ours_cmp = compare(OUR_VARIANT, f"{owner}:{default_branch}")

        branches = paginate(f"repos/{full_name}/branches?per_page=100&page={{page}}")
        default_sha = next((branch["commit"]["sha"] for branch in branches if branch["name"] == default_branch), None)

        extra_branch_summaries: list[BranchSummary] = []
        for branch in branches:
            branch_name = branch["name"]
            branch_sha = branch["commit"]["sha"]
            if branch_name == default_branch:
                continue
            if not branch_should_be_checked(branch_name, branch_sha, default_sha):
                continue

            branch_cmp = compare(UPSTREAM, f"{owner}:{branch_name}")
            if branch_cmp.get("error"):
                if "No common ancestor" not in branch_cmp.get("error_message", ""):
                    continue
            elif branch_cmp.get("ahead_by", 0) <= 0:
                continue

            extra_branch_summaries.append(
                BranchSummary(
                    name=branch_name,
                    compare=branch_cmp,
                    summary=summarize_branch(branch_name, branch_cmp),
                    areas=top_areas(branch_cmp),
                    subjects=unique_cleaned_subjects(branch_cmp, limit=8),
                )
            )

        extra_branch_summaries.sort(
            key=lambda item: 0 if item.compare.get("error") else item.compare.get("ahead_by", 0),
            reverse=True,
        )

        rating, recommendation_text = recommendation(default_cmp, extra_branch_summaries)
        default_topics = build_topic_summaries(default_branch, default_cmp)
        default_subjects = unique_cleaned_subjects(default_cmp, limit=4)
        ours_topics = (
            build_topic_summaries(default_branch, ours_cmp)
            if not ours_cmp.get("error") and ours_cmp.get("ahead_by", 0) > 0
            else []
        )

        repo_readme_hint = None
        if default_cmp.get("error") and "No common ancestor" in default_cmp.get("error_message", ""):
            readme = get_repo_file(full_name, "README.md", default_branch)
            if readme:
                repo_readme_hint = "\n".join(readme.splitlines()[:12]).strip()

        lines = [
            f"# {full_name}",
            "",
            f"- URL: https://github.com/{full_name}",
            f"- Снимок: `{SNAPSHOT_DATE}`",
            f"- Default branch: `{default_branch}`",
            f"- Создан форк: `{fork.get('created_at', 'n/a')}`",
            f"- Последний push: `{fork.get('pushed_at', 'n/a')}`",
            f"- Веток в форке: `{len(branches)}`",
            f"- Оценка полезности: `{rating}`",
            "",
            "## Коротко по-человечески",
            "",
        ]

        if default_cmp.get("error"):
            message = default_cmp.get("error_message", "compare failed")
            if "No common ancestor" in message:
                lines.append("- Это не просто слегка изменённый fork: история оторвана от upstream настолько, что GitHub не может построить обычный compare.")
                if repo == "codex-lb-ts" or "ts" in repo.lower():
                    lines.append("- По названию и состоянию похоже на отдельную TypeScript-реализацию/порт, а не на обычный patch-set поверх Python-версии.")
                if repo_readme_hint:
                    lines.extend(["- README подтверждает, что проект живёт как отдельная линия развития:", "", "```md", repo_readme_hint, "```"])
            else:
                lines.append(f"- GitHub не дал автоматический compare: `{message}`.")
        elif default_cmp.get("ahead_by", 0) == 0:
            if extra_branch_summaries:
                lines.append("- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.")
            else:
                lines.append("- На default-ветке своих изменений поверх upstream нет, и заметных уникальных feature-веток тоже не найдено.")
        else:
            lines.append(f"- Default-ветка содержит `{default_cmp.get('ahead_by', 0)}` уникальных коммитов поверх upstream.")
            if default_subjects:
                lines.append(f"- По уникальным коммитам видно: {'; '.join(default_subjects[:3])}.")
            elif default_topics:
                lines.extend(default_topics)

        lines.append(f"- Рекомендация: {recommendation_text}")

        lines.extend(["", "## Default branch vs upstream/main", ""])
        lines.append(f"- Статус: {compare_status_line(default_cmp)}.")
        if not default_cmp.get("error"):
            if default_subjects:
                lines.append("- Уникальные коммиты/темы:")
                lines.extend(markdown_list(default_subjects, indent="  - "))
            default_areas = top_areas(default_cmp)
            if default_areas:
                lines.append("- Где менялся код:")
                lines.extend([f"  - `{area}`: {count} файлов" for area, count in default_areas])
            names = file_names(default_cmp)[:12]
            if names:
                lines.append("- Ключевые изменённые файлы:")
                lines.extend([f"  - `{name}`" for name in names])

        lines.extend(["", "## Default branch vs наш develop", ""])
        lines.append(f"- Статус: {compare_status_line(ours_cmp)}.")
        if not ours_cmp.get("error"):
            if ours_cmp.get("ahead_by", 0) == 0 and ours_cmp.get("behind_by", 0) == 0:
                lines.append("- С нашим `develop` fork по сути совпадает.")
            elif ours_cmp.get("ahead_by", 0) > 0:
                if ours_topics:
                    lines.extend(ours_topics)
                else:
                    extra_subjects = unique_cleaned_subjects(ours_cmp, limit=3)
                    if extra_subjects:
                        lines.append(f"- Относительно нашего `develop` здесь дополнительно есть: {'; '.join(extra_subjects)}.")
            else:
                lines.append("- Всё уникальное в этом fork либо уже есть у нас, либо fork просто отстаёт от нашего develop.")

        lines.extend(["", "## Дополнительные ветки в fork", ""])
        if extra_branch_summaries:
            for branch in extra_branch_summaries[:12]:
                lines.append(branch.summary)
                if branch.subjects:
                    lines.append("  - Коммиты: " + "; ".join(branch.subjects[:4]) + ".")
                if branch.areas:
                    area_text = ", ".join(f"`{area}` ({count})" for area, count in branch.areas[:4])
                    lines.append(f"  - Основные зоны: {area_text}.")
        else:
            lines.append("- Отдельных нетривиальных веток с уникальным кодом не обнаружено.")

        lines.extend(["", "## Итог", "", f"- Вердикт: `{rating}`.", f"- Практический вывод: {recommendation_text}"])

        write_text(reports_dir / f"{slugify(full_name)}.md", "\n".join(lines))

        reports_index.append(
            {
                "full_name": full_name,
                "rating": rating,
                "default_ahead": default_cmp.get("ahead_by", 0) if not default_cmp.get("error") else None,
                "extra_count": len(extra_branch_summaries),
                "default_subjects": default_subjects[:2],
                "recommendation": recommendation_text,
                "first_branch_subjects": extra_branch_summaries[0].subjects[:2] if extra_branch_summaries else [],
            }
        )
        fork_checklist_rows.append(
            {
                "full_name": full_name,
                "rating": rating,
                "default_ahead": default_cmp.get("ahead_by", 0) if not default_cmp.get("error") else -1,
                "borrow": should_borrow_from_fork(
                    repo=repo,
                    rating=rating,
                    default_cmp=default_cmp,
                    extra_branch_summaries=extra_branch_summaries,
                    default_topics=default_topics,
                    default_subjects=default_subjects,
                ),
                "already": already_in_our_variant(ours_cmp=ours_cmp, extra_branch_summaries=extra_branch_summaries),
                "summary": build_checklist_summary(
                    full_name=full_name,
                    repo=repo,
                    default_cmp=default_cmp,
                    extra_branch_summaries=extra_branch_summaries,
                    default_topics=default_topics,
                    default_subjects=default_subjects,
                    recommendation_text=recommendation_text,
                ),
            }
        )

        if default_cmp.get("error"):
            key_note = "переписанная/оторванная история"
            sort_ahead = 999
        elif default_subjects:
            key_note = "; ".join(default_subjects[:2])
            sort_ahead = default_cmp.get("ahead_by", 0)
        elif extra_branch_summaries:
            key_note = "; ".join(extra_branch_summaries[0].subjects[:2]) or extra_branch_summaries[0].summary
            sort_ahead = default_cmp.get("ahead_by", 0)
        else:
            subjects = unique_cleaned_subjects(default_cmp, limit=1)
            key_note = subjects[0] if subjects else "нет своих изменений"
            sort_ahead = default_cmp.get("ahead_by", 0)

        catalog_rows.append((rating, sort_ahead, full_name, len(extra_branch_summaries), key_note))

    reports_index.sort(key=lambda item: (RATING_ORDER.get(item["rating"], 9), -(item["default_ahead"] or 0), item["full_name"]))
    catalog_rows.sort(key=lambda row: (RATING_ORDER.get(row[0], 9), -row[1], row[2]))

    repo_data, _ = gh_api("repos/Soju06/codex-lb")
    repo_data = repo_data if isinstance(repo_data, dict) else {}
    summary_counts = Counter(item["rating"] for item in reports_index)

    index_lines = [
        "# Исследование форков codex-lb",
        "",
        f"- Снимок: `{SNAPSHOT_DATE}` (`{snapshot_iso}` UTC)",
        "- Upstream: `Soju06/codex-lb@main`",
        "- Наша база сравнения: `evgenybabenko/codex-lb@develop`",
        f"- Доступно через API: `{len(forks)}` форков",
        f"- GitHub сообщает общее число форков: `{repo_data.get('forks_count', 'n/a')}`",
        "- Если числа не совпадают, один или несколько форков могли быть удалены, скрыты или временно недоступны через API.",
        "",
        "## Быстрые ссылки",
        "",
        "- [Топ фич и что реально улучшит использование](./top-features.md)",
        "- [Единый чек-лист: просмотрено / хотим / уже у нас](./feature-decision-checklist.md)",
        "- [Чек-лист по форкам: просмотрено / тянем / уже у нас](./fork-review-checklist.md)",
        "- [База сравнения с нашим develop](./baseline-evgenybabenko-develop.md)",
        "",
        "## Что важно в двух строках",
        "",
        f"- `High`: {summary_counts.get('High', 0)}",
        f"- `Medium`: {summary_counts.get('Medium', 0)}",
        f"- `Low`: {summary_counts.get('Low', 0)}",
        f"- `None`: {summary_counts.get('None', 0)}",
        "",
        "## Самые интересные кандидаты на перенос",
        "",
    ]

    for item in [entry for entry in reports_index if entry["rating"] in {"High", "Medium"}][:20]:
        topic_note = "; ".join(item["default_subjects"]) or "; ".join(item["first_branch_subjects"]) or item["recommendation"]
        index_lines.append(
            f"- [{item['full_name']}]({report_link(item['full_name'])}) — `{item['rating']}`; "
            f"default ahead `{item['default_ahead']}`; доп. веток `{item['extra_count']}`. {topic_note}"
        )

    index_lines.extend(
        [
            "",
            "## Полный каталог",
            "",
            "| Fork | Rating | Default unique vs upstream | Доп. ветки | Отчёт | Ключевая мысль |",
            "|---|---:|---:|---:|---|---|",
        ]
    )
    for rating, sort_ahead, full_name, extra_count, key_note in catalog_rows:
        ahead_text = "n/a" if sort_ahead == 999 else str(sort_ahead)
        safe_note = key_note.replace("|", "/").replace("\n", " ")
        index_lines.append(
            f"| `{full_name}` | `{rating}` | `{ahead_text}` | `{extra_count}` | "
            f"[report]({report_link(full_name)}) | {safe_note} |"
        )

    write_text(out_dir / "README.md", "\n".join(index_lines))

    fork_checklist_rows.sort(
        key=lambda item: (
            RATING_ORDER.get(item["rating"], 9),
            -(item["default_ahead"] if item["default_ahead"] is not None else -1),
            item["full_name"],
        )
    )

    checklist_lines = [
        "# Чек-лист по форкам",
        "",
        f"- Снимок: `{SNAPSHOT_DATE}` (`{snapshot_iso}` UTC)",
        f"- Просмотрено через API: `{len(forks)}` форков",
        f"- GitHub forks_count: `{repo_data.get('forks_count', 'n/a')}`",
        "- Если здесь форков меньше, чем на GitHub, значит один или несколько форков были недоступны через API на момент снимка.",
        "",
        "## Как читать",
        "",
        "- `Просмотрен` означает, что по форку есть отдельный отчёт и он был сравнен с upstream и вашим публичным `develop`.",
        "- `Берём` означает, что в форке есть идеи, которые имеет смысл тянуть к нам хотя бы выборочно.",
        "- `Уже у нас` означает, что по видимой default-ветке и найденным feature-веткам этот fork не даёт заметного кода сверх вашего публичного `develop`.",
        "",
    ]

    for rating in ("High", "Medium", "Low", "None"):
        rows = [item for item in fork_checklist_rows if item["rating"] == rating]
        if not rows:
            continue
        checklist_lines.extend(
            [
                f"## {rating}",
                "",
                "| Fork | Просмотрен | Берём | Уже у нас | Что там интересного |",
                "|---|---:|---:|---:|---|",
            ]
        )
        for item in rows:
            summary = item["summary"].replace("|", "/").replace("\n", " ").strip()
            checklist_lines.append(
                f"| [{item['full_name']}]({report_link(item['full_name'])}) | [x] | "
                f"{'[x]' if item['borrow'] else '[ ]'} | "
                f"{'[x]' if item['already'] else '[ ]'} | {summary} |"
            )
        checklist_lines.append("")

    write_text(out_dir / "fork-review-checklist.md", "\n".join(checklist_lines))
    print(f"Wrote reports to {out_dir}")


if __name__ == "__main__":
    main()
