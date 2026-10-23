"use client";

import Cookies from "js-cookie";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  AutoImage,
  AutoLink,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FileRepository,
  Font,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageInsert,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  Paragraph,
  Plugin,
  RemoveFormat,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
  type FileLoader,
  type UploadAdapter,
} from "ckeditor5";
import idTranslations from "ckeditor5/translations/id.js";
import "ckeditor5/ckeditor5.css";

class NewsUploadAdapter implements UploadAdapter {
  private xhr: XMLHttpRequest | null = null;

  constructor(private loader: FileLoader) {}

  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise<{ default: string }>((resolve, reject) => {
          if (!file) {
            reject("Berkas gambar kosong");
            return;
          }
          const body = new FormData();
          body.append("file", file);
          const xhr = new XMLHttpRequest();
          this.xhr = xhr;
          xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/upload`);
          const token = Cookies.get("token");
          if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.onload = () => {
            try {
              const payload = JSON.parse(xhr.responseText || "{}");
              if (xhr.status < 200 || xhr.status >= 300 || !payload.url) {
                reject(payload.error || payload.message || "Gagal mengunggah gambar");
                return;
              }
              resolve({ default: payload.url });
            } catch {
              reject("Gagal mengunggah gambar");
            }
          };
          xhr.onerror = () => reject("Gagal mengunggah gambar");
          xhr.send(body);
        }),
    );
  }

  abort() {
    this.xhr?.abort();
  }
}

class NewsUploadPlugin extends Plugin {
  static get requires() {
    return [FileRepository] as const;
  }

  static get pluginName() {
    return "NewsUploadPlugin" as const;
  }

  init() {
    const repository = this.editor.plugins.get(FileRepository);
    repository.createUploadAdapter = (loader) => new NewsUploadAdapter(loader);
  }
}

const editorConfig = {
  licenseKey: "GPL",
  language: "id",
  translations: [idTranslations],
  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Font,
    Alignment,
    List,
    Indent,
    IndentBlock,
    Link,
    AutoLink,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    ImageInsert,
    AutoImage,
    BlockQuote,
    Table,
    TableToolbar,
    HorizontalLine,
    RemoveFormat,
    NewsUploadPlugin,
  ],
  toolbar: {
    shouldNotGroupWhenFull: true,
    items: [
      "undo",
      "redo",
      "|",
      "heading",
      "|",
      "fontFamily",
      "fontSize",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "alignment",
      "|",
      "bulletedList",
      "numberedList",
      "outdent",
      "indent",
      "|",
      "link",
      "insertImage",
      "blockQuote",
      "insertTable",
      "horizontalLine",
      "|",
      "removeFormat",
    ],
  },
  heading: {
    options: [
      { model: "paragraph" as const, title: "Paragraf", class: "ck-heading_paragraph" },
      { model: "heading2" as const, view: "h2" as const, title: "Judul besar", class: "ck-heading_heading2" },
      { model: "heading3" as const, view: "h3" as const, title: "Judul sedang", class: "ck-heading_heading3" },
      { model: "heading4" as const, view: "h4" as const, title: "Judul kecil", class: "ck-heading_heading4" },
    ],
  },
  fontFamily: {
    supportAllValues: true,
    options: [
      "default",
      "Arial, Helvetica, sans-serif",
      "Georgia, serif",
      "Times New Roman, Times, serif",
      "Verdana, Geneva, sans-serif",
      "Tahoma, Geneva, sans-serif",
      "Trebuchet MS, Helvetica, sans-serif",
      "Courier New, Courier, monospace",
    ],
  },
  fontSize: {
    supportAllValues: true,
    options: [10, 12, 14, "default", 16, 18, 20, 24, 28, 32, 40],
  },
  image: {
    toolbar: [
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
      "|",
      "toggleImageCaption",
      "imageTextAlternative",
    ],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  link: {
    addTargetToExternalLinks: true,
  },
};

export function NewsEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  return (
    <div className="news-editor overflow-hidden rounded-xl ring-1 ring-border">
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={editorConfig}
        onChange={(_event, editor) => onChange(editor.getData())}
      />
      <p className="border-t border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Gambar bisa disisipkan dari komputer atau tautan. Font, ukuran, gaya paragraf, tebal, dan miring diatur dari toolbar.
      </p>
    </div>
  );
}
