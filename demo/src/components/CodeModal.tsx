import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Editor from "@monaco-editor/react";

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeSnippet: string;
}

const CodeModal = ({ isOpen, onClose, codeSnippet }: CodeModalProps) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Copy failed handling
    }
  }, [codeSnippet]);

  const isJsonContent = useCallback(() => {
    try {
      JSON.parse(codeSnippet);
      return true;
    } catch (e) {
      return false;
    }
  }, [codeSnippet]);

  const getLanguage = useCallback(() => {
    return isJsonContent() ? "json" : "typescript";
  }, [isJsonContent]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isJsonContent() ? "GeoJSON Data" : "Component Code"}</h2>
          <div className="modal-actions">
            <button
              className={`copy-button ${copySuccess ? "success" : ""}`}
              onClick={handleCopyCode}
            >
              {copySuccess ? "Copied!" : "Copy"}
            </button>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        <div className="code-editor">
          <Editor
            height="60vh"
            defaultLanguage={getLanguage()}
            value={codeSnippet}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              tabSize: 2,
              automaticLayout: true,
              folding: true,
              foldingStrategy: "indentation",
              showFoldingControls: "always",
              lineNumbers: "on",
              renderValidationDecorations: "off",
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                useShadows: true,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CodeModal;
