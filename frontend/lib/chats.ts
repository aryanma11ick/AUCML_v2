// frontend/lib/chats.ts
import { supabase } from "@/lib/supabaseClient";

export type ChatRow = { id: string; title: string; created_at: string };
export type MessageRow = {
  id: string;
  chat_id: string;
  user_id: string | null;
  role: "user" | "assistant";
  content: string;
  image_base64?: string | null;
  created_at: string;
};

export async function listChats(userId: string) {
  const { data, error } = await supabase
    .from<ChatRow>("chats")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createChat(userId: string, title = "New chat") {
  const { data, error } = await supabase
    .from("chats")
    .insert({ user_id: userId, title })
    .select("*")
    .single();

  if (error) throw error;
  return data as ChatRow;
}

export async function loadMessages(chatId: string) {
  const { data, error } = await supabase
    .from<MessageRow>("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function insertMessage(msg: {
  chat_id: string;
  user_id: string | null;
  role: "user" | "assistant";
  content: string;
  image_base64?: string | null;
}) {
  const { data, error } = await supabase
    .from("messages")
    .insert(msg)
    .select("*")
    .single();

  if (error) throw error;
  return data as MessageRow;
}
