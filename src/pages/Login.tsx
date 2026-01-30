import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    const result = await login(values.email, values.password);
    if (result.ok) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } else {
      setSubmitError(result.error ?? "Falha ao entrar.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Lado esquerdo: branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary text-primary-foreground flex-col justify-center p-12 lg:p-16">
        <div className="max-w-md">
          <div className="w-14 h-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-8">
            <svg viewBox="0 0 60 60" className="w-9 h-9 text-primary-foreground">
              <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M 30 15 Q 20 20 18 30 Q 20 40 30 45 Q 40 40 42 30 Q 40 20 30 15 Z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M 30 20 Q 24 24 23 30 Q 24 36 30 40 Q 36 36 37 30 Q 36 24 30 20 Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            Fórmula da Terra
          </h2>
          <p className="text-primary-foreground/80 text-sm lg:text-base">
            Farmácia de manipulação e bem estar, desde 2004. Acesse o dashboard para acompanhar vendas, transações e estatísticas.
          </p>
        </div>
      </div>

      {/* Lado direito: formulário */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="md:hidden text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-xl bg-primary text-primary-foreground items-center justify-center mb-4">
              <svg viewBox="0 0 60 60" className="w-7 h-7">
                <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M 30 15 Q 20 20 18 30 Q 20 40 30 45 Q 40 40 42 30 Q 40 20 30 15 Z" fill="currentColor" opacity="0.9" />
                <path d="M 30 20 Q 24 24 23 30 Q 24 36 30 40 Q 36 36 37 30 Q 36 24 30 20 Z" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground">Fórmula da Terra</h1>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Entrar</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Use seu e-mail e senha para acessar o dashboard.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="text-xs text-muted-foreground text-center">
            Não há cadastro: use qualquer e-mail válido e uma senha com 4+ caracteres para entrar.
          </p>
        </div>
      </div>
    </div>
  );
}
