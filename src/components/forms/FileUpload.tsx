"use client"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface FileUploadProps {
  onUploadComplete: (files: Array<{ nom_fichier: string; chemin_fichier: string; type_fichier: string; taille_fichier: number }>) => void
  maxSize?: number // en MB
  accept?: string
  multiple?: boolean
}

export function FileUpload({ onUploadComplete, maxSize = 5, accept, multiple = true }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`Le fichier ${file.name} dépasse la taille maximale de ${maxSize}MB`)
        return false
      }
      return true
    })
    setFiles([...files, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    const uploadedFiles: Array<{ nom_fichier: string; chemin_fichier: string; type_fichier: string; taille_fichier: number }> = []

    try {
      for (const file of files) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `documents/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("documents-ordre-mission")
          .upload(filePath, file)

        if (uploadError) throw uploadError

        uploadedFiles.push({
          nom_fichier: file.name,
          chemin_fichier: filePath,
          type_fichier: file.type,
          taille_fichier: file.size,
        })
      }

      onUploadComplete(uploadedFiles)
      setFiles([])
    } catch (error: any) {
      alert(`Erreur lors de l'upload: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
          <Upload className="h-4 w-4" />
          Sélectionner des fichiers
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept={accept}
            multiple={multiple}
          />
        </label>
        {files.length > 0 && (
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Upload en cours..." : `Uploader ${files.length} fichier(s)`}
          </Button>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Fichiers sélectionnés:</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


