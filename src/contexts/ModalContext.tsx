import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import CodeModal from '../components/CodeModal';

interface ModalContextType {
  openCodeModal: (codeSnippet: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');

  const openCodeModal = useCallback((snippet: string) => {
    setCodeSnippet(snippet);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <ModalContext.Provider value={{ openCodeModal, closeModal }}>
      {children}
      <CodeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        codeSnippet={codeSnippet}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 