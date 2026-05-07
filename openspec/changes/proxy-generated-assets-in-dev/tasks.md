## 1. Regression Coverage

- [x] 1.1 Add a client regression test that fails if `/generated-assets` is not proxied through the Vite dev server
- [x] 1.2 Add a server regression test that fails if missing `/generated-assets/...` requests return the SPA shell

## 2. Dev Proxy Fix

- [x] 2.1 Update the Vite dev server proxy configuration so `/generated-assets` uses the backend target
- [x] 2.2 Update server/static asset handling so missing `/generated-assets/...` requests return missing-asset responses instead of the SPA shell
- [x] 2.3 Clear broken managed instructional image references when the owned asset file is missing so the normal backfill flow can recover them

## 3. Validation

- [x] 3.1 Run OpenSpec validation for `proxy-generated-assets-in-dev`
- [x] 3.2 Run the relevant client test coverage for the Vite proxy configuration
