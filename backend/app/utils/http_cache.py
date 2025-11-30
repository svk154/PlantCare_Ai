from flask import request, make_response
import hashlib
from datetime import datetime

def add_etag(response, payload: bytes):
    try:
        etag = hashlib.sha256(payload).hexdigest()
        response.set_etag(etag)
        # Handle conditional request
        if request.if_none_match and etag in request.if_none_match:
            return make_response('', 304)
    except Exception:
        pass
    return response

def add_last_modified(response, dt: datetime):
    try:
        response.last_modified = dt
    except Exception:
        pass
    return response
