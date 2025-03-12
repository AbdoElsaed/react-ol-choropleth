import { createContext, useContext, useState, ReactNode } from "react";
import CodeModal from "../components/CodeModal";

interface ModalContextType {
  openCodeModal: (code: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");

  const openCodeModal = (code: string) => {
    setCodeSnippet(code);
    setIsOpen(true);
  };

  return (
    <ModalContext.Provider value={{ openCodeModal }}>
      {children}
      <CodeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        codeSnippet={codeSnippet}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
