
import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const DocumentUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("User not authenticated");

      const filePath = `${userId}/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('client_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client_documents')
        .getPublicUrl(filePath);

      // Store document metadata in the documents table
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          document_type: 'client_upload',
          uploaded_by: userId
          // project_id is now optional and can be omitted
        });

      if (dbError) throw dbError;

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        onChange={handleInputChange}
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        disabled={isUploading}
        className="hidden"
        id="document-upload"
      />
      <motion.div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? 'var(--primary)' : 'var(--border)',
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {isUploading ? (
          <div className="space-y-4">
            <FileText className="w-12 h-12 mx-auto text-primary animate-pulse" />
            <div className="text-sm text-muted-foreground">Uploading...</div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <label
              htmlFor="document-upload"
              className="mt-4 block text-sm font-medium text-center cursor-pointer"
            >
              <span className="text-primary">Click to upload</span> or drag and drop
              <p className="text-xs text-muted-foreground mt-2">
                PDF, DOC, DOCX, TXT, JPG, JPEG, or PNG
              </p>
            </label>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DocumentUpload;
