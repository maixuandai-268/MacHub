import { http } from "@/services/http";

export type UploadedImageAsset = {
  url: string;
  alt: string;
  filename: string;
  mimeType: string;
  size: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function uploadAdminImages(
  files: File[],
  scope: "products" | "categories" | "blog"
) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await http.post<ApiResponse<UploadedImageAsset[]>>(
    "/admin/uploads/images",
    formData,
    {
      params: { scope },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
}
