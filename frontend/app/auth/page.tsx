// app/auth/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async (type: "login" | "signup") => {
    setLoading(true);
    setError("");

    const { error } =
      type === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      if (type === "login") router.push("/chat");
      else alert("Check your email to verify your account!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-white">
      <Card className="w-[380px] bg-white border border-gray-200 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-purple-600">
            Aura
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 bg-gray-100 rounded-lg p-1">
              <TabsTrigger value="login" className="data-[state=active]:bg-white rounded-md">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white rounded-md">
                Signup
              </TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <div className="flex flex-col gap-3 mt-4">
                <Input
                  type="email"
                  placeholder="Email"
                  className=""
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => handleAuth("login")}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup">
              <div className="flex flex-col gap-3 mt-4">
                <Input
                  type="email"
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => handleAuth("signup")}
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
