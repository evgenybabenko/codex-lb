## 1. Overload normalization

- [x] 1.1 Normalize upstream capacity/overload messages into a stable recoverable error code
- [x] 1.2 Extend websocket handshake overload hints to the same normalized error code

## 2. Stream failover behavior

- [x] 2.1 Treat normalized overload errors as recoverable account-health failures in the stream retry/failover path
- [x] 2.2 Classify normalized overload errors as rate-limit class in request-log status mapping

## 3. Validation

- [x] 3.1 Add regression coverage for message-based overload normalization
- [x] 3.2 Add regression coverage for stream failover on overload/capacity failures
- [x] 3.3 Add regression coverage for request-log rate-limit filtering of overload failures
- [x] 3.4 Validate OpenSpec artifacts and run targeted tests
