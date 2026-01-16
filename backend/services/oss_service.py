import os
import oss2


def _get_bucket() -> oss2.Bucket:
    access_key_id = os.getenv("OSS_ACCESS_KEY_ID", "").strip()
    access_key_secret = os.getenv("OSS_ACCESS_KEY_SECRET", "").strip()
    endpoint = os.getenv("OSS_ENDPOINT", "").strip()
    bucket_name = os.getenv("OSS_BUCKET_NAME", "").strip()

    if not all([access_key_id, access_key_secret, endpoint, bucket_name]):
        raise RuntimeError("OSS configuration is incomplete")

    auth = oss2.Auth(access_key_id, access_key_secret)
    return oss2.Bucket(auth, endpoint, bucket_name)


def upload_bytes(object_key: str, content: bytes, content_type: str) -> None:
    bucket = _get_bucket()
    bucket.put_object(object_key, content, headers={"Content-Type": content_type})
