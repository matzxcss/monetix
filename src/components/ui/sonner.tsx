import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { TOAST_CLASSNAMES } from "./sonner-constants";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: TOAST_CLASSNAMES,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
