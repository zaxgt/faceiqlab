import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";

const SignIn = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-neutral-950 text-white">
      <div className="w-[400px] p-6 rounded-xl bg-neutral-900 shadow-lg">
        <h1 className="text-2xl mb-4 font-bold text-center">Sign In</h1>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />
      </div>
    </div>
  );
};

export default SignIn;
