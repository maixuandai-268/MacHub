import { http } from "@/services/http";

export type AdminBlogPostSection = {
  heading: string;
  body: string[];
};

export type AdminBlogPost = {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  readTime: string;
  status: string;
  publishedAt: string | null;
  authorName: string;
  sections: AdminBlogPostSection[];
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getAdminBlogPosts(params?: Record<string, string | number | boolean>) {
  const response = await http.get<ApiResponse<AdminBlogPost[]>>("/admin/blog-posts", {
    params,
  });

  return response.data;
}

export async function createAdminBlogPost(payload: Record<string, unknown>) {
  const response = await http.post<ApiResponse<AdminBlogPost>>("/admin/blog-posts", payload);
  return response.data.data;
}

export async function updateAdminBlogPost(
  postId: string,
  payload: Record<string, unknown>
) {
  const response = await http.patch<ApiResponse<AdminBlogPost>>(
    `/admin/blog-posts/${postId}`,
    payload
  );
  return response.data.data;
}

export async function deleteAdminBlogPost(postId: string) {
  const response = await http.delete<ApiResponse<AdminBlogPost>>(
    `/admin/blog-posts/${postId}`
  );
  return response.data.data;
}
