import {
    generateReactHelpers,
    generateUploadButton,
    generateUploadDropzone,
  } from "@uploadthing/react";

  
  import type { OurFileRouter } from "@/app/api/uploadthing/core";
  
  export const UploadButton = generateUploadButton<OurFileRouter>();
  export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

  /** Programmatic uploads — the article editor inserts images from its toolbar
      rather than from a dropzone. */
  export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
  