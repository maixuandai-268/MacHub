import { http } from "@/services/http";
import type { BlogPost } from "../data/posts";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getBlogPosts() {
  const response = await http.get<ApiResponse<BlogPost[]>>("/blog-posts");
  return response.data.data;
}

export async function getBlogPostDetail(slug: string) {
  const response = await http.get<ApiResponse<BlogPost>>(`/blog-posts/${slug}`);
  return response.data.data;
}
