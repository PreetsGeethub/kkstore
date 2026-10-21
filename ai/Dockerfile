FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/home/kkstore/.cache/huggingface

WORKDIR /app

RUN useradd --create-home --shell /usr/sbin/nologin kkstore

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch \
    && pip install --no-cache-dir -r requirements.txt

COPY --chown=kkstore:kkstore app ./app
COPY --chown=kkstore:kkstore knowledge ./knowledge

RUN mkdir -p /home/kkstore/.cache/huggingface \
    && chown -R kkstore:kkstore /home/kkstore

USER kkstore

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
