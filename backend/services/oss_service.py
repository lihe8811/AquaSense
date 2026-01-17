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


def download_bytes(object_key: str) -> tuple[bytes, str | None]:
    bucket = _get_bucket()
    result = bucket.get_object(object_key)
    content = result.read()
    content_type = None
    if hasattr(result, "headers") and result.headers:
        content_type = result.headers.get("Content-Type")
    return content, content_type


def list_report_objects(user_id: str) -> list[dict[str, str]]:
    bucket = _get_bucket()
    prefix = f"{user_id}/"
    reports = []
    for obj in oss2.ObjectIteratorV2(bucket, prefix=prefix):
        key = obj.key
        if key.endswith("/report/report.json"):
            reports.append(
                {
                    "object_key": key,
                    "last_modified": str(obj.last_modified),
                }
            )
    return reports


def get_object_url(object_key: str, expires: int = 3600) -> str:
    bucket = _get_bucket()
    return bucket.sign_url("GET", object_key, expires)
