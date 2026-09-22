"""
Shared-secret gate for write and admin endpoints.

Not real user auth — there's no login, no per-user identity, just one API key
that the frontend's server-side code attaches automatically. It exists to
close the "anyone on the internet can POST a batch or read the KVIC dashboard"
gap. Real phone+OTP login (see README "Next steps") is the follow-up; this is
the minimum that makes the write/admin surface not wide open today.
"""

import os

from fastapi import Header, HTTPException

API_KEY = os.getenv("API_KEY", "dev-local-key")


def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Missing or invalid API key")
