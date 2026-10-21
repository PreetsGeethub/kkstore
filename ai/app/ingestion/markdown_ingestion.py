from pathlib import Path


def load_markdown(file_path: str) -> str:
    path = Path(file_path)

    with path.open("r", encoding="utf-8") as file:
        return file.read()


def chunk_by_headers(text: str, filename: str) -> list[dict]:
    chunks = []

    current_section = None
    current_lines = []

    for line in text.splitlines():

        # Document title
        if line.startswith("# "):
            continue

        # New section
        elif line.startswith("## "):

            # Save previous section before starting the new one
            if current_section and current_lines:
                chunk_text = "\n".join(current_lines).strip()

                section_slug = current_section.lower().replace(" ", "_")

                chunks.append(
                    {
                        "chunk_id": f"{Path(filename).stem}_{section_slug}",
                        "source": filename,
                        "section": current_section,
                        "text": chunk_text,
                    }
                )

            current_section = line.lstrip("#").strip()
            current_lines = []

        else:
            current_lines.append(line)

    # Flush the final section
    if current_section and current_lines:
        chunk_text = "\n".join(current_lines).strip()

        section_slug = current_section.lower().replace(" ", "_")

        chunks.append(
            {
                "chunk_id": f"{Path(filename).stem}_{section_slug}",
                "source": filename,
                "section": current_section,
                "text": chunk_text,
            }
        )

    return chunks


if __name__ == "__main__":
    filename = "return_policy.md"

    text = load_markdown(
        f"knowledge/{filename}"
    )

    chunks = chunk_by_headers(text, filename)

    for chunk in chunks:
        print(chunk)
        print("-" * 50)