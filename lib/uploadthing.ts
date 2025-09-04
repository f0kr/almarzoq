import {
    generateUploadButton,
    generateUploadDropzone,
  } from "@uploadthing/react";

  import {UTApi} from 'uploadthing/server';
  
  import type { OurFileRouter } from "@/app/api/uploadthing/core";
  
  export const utapi = new UTApi();

  export const UploadButton = generateUploadButton<OurFileRouter>();
  export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
  