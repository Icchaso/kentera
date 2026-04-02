#!/usr/bin/env python3
"""PPTX → PDF 変換（LibreOffice headless）"""
import subprocess
import sys
import os


def convert_to_pdf(input_path, output_dir=None):
    """PPTXファイルをPDFに変換"""
    if not os.path.isfile(input_path):
        print(f"エラー: ファイルが見つかりません: {input_path}", file=sys.stderr)
        sys.exit(1)

    output_dir = output_dir or os.path.dirname(os.path.abspath(input_path))
    os.makedirs(output_dir, exist_ok=True)

    cmd = [
        "libreoffice",
        "--headless",
        "--convert-to", "pdf",
        "--outdir", output_dir,
        input_path,
    ]

    print(f"変換中: {input_path} → {output_dir}/")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

    if result.returncode != 0:
        print(f"エラー: LibreOffice変換失敗\n{result.stderr}", file=sys.stderr)
        sys.exit(1)

    base = os.path.splitext(os.path.basename(input_path))[0]
    pdf_path = os.path.join(output_dir, f"{base}.pdf")
    if os.path.isfile(pdf_path):
        print(f"PDF生成完了: {pdf_path}")
    else:
        print(f"警告: PDFファイルが見つかりません: {pdf_path}", file=sys.stderr)

    return pdf_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python soffice.py <input.pptx> [output_dir]", file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]
    out_dir = sys.argv[2] if len(sys.argv) > 2 else None
    convert_to_pdf(input_file, out_dir)
