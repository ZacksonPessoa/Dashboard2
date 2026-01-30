import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Algo deu errado</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p className="text-sm">{this.state.error.message}</p>
              <p className="text-xs text-muted-foreground">
                Abra o Console do navegador (F12 → Console) para mais detalhes.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    return this.props.children;
  }
}
