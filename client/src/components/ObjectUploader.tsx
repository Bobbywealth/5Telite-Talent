import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { uploadToGcs } from "@/lib/uploadToGcs";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onComplete?: (uploadedFiles: { objectName: string; fileName: string }[]) => void;
  buttonClassName?: string;
  children: ReactNode;
  prefix?: string; // e.g., 'headshots', 'portfolios'
}

/**
 * A file upload component that handles Google Cloud Storage uploads.
 * 
 * Features:
 * - File selection via hidden input
 * - Direct upload to Google Cloud Storage
 * - Progress indication
 * - Multiple file support
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed (default: 5)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onComplete - Callback with uploaded file info
 * @param props.buttonClassName - CSS class for the button
 * @param props.children - Button content
 * @param props.prefix - GCS folder prefix (default: 'uploads')
 */
export function ObjectUploader({
  maxNumberOfFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  onComplete,
  buttonClassName = "",
  children,
  prefix = "uploads",
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ objectName: string; fileName: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    if (files.length > maxNumberOfFiles) {
      toast({
        title: "Too many files",
        description: `Please select no more than ${maxNumberOfFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Files must be smaller than ${Math.round(maxFileSize / 1024 / 1024)}MB.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const results: { objectName: string; fileName: string }[] = [];

    try {
      for (const file of files) {
        const objectName = await uploadToGcs(file, prefix);
        results.push({ objectName, fileName: file.name });
      }

      setUploadedFiles(results);
      
      toast({
        title: "Upload successful",
        description: `${files.length} file(s) uploaded successfully.`,
      });

      if (onComplete) {
        onComplete(results);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        className={buttonClassName}
        variant="outline"
        type="button"
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          children
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxNumberOfFiles > 1}
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {uploadedFiles.length > 0 && (
        <div className="mt-2 text-sm text-green-600">
          {uploadedFiles.length} file(s) uploaded successfully
        </div>
      )}
    </>
  );
}