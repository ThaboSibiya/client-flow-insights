import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const CompanyLogoUploader = () => {
    const { user } = useAuth();
    const { profile, updateCompanyLogo, isLoading: isProfileLoading } = useCompanyProfile();
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !user) return;

        setUploading(true);

        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('company_logos')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('company_logos')
                .getPublicUrl(filePath);

            if (!publicUrl) {
                throw new Error('Could not get public URL for the uploaded logo.');
            }
            
            const uniqueUrl = `${publicUrl.split('?')[0]}?t=${new Date().getTime()}`;

            await updateCompanyLogo(uniqueUrl);

            toast({ title: 'Logo uploaded successfully!' });
            setSelectedFile(null);
            setPreview(null);
        } catch (error: any) {
            toast({
                title: 'Upload failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Company Logo</CardTitle>
                <CardDescription>Upload a logo to appear on your quotes and invoices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="logo-upload">Logo Image</Label>
                    <Input id="logo-upload" type="file" onChange={handleFileChange} accept="image/*" disabled={uploading} />
                </div>
                
                {(preview || profile?.company_logo_url) && (
                    <div>
                        <Label>Logo Preview</Label>
                        <div className="mt-2 w-48 h-24 border rounded-md p-2 flex items-center justify-center bg-gray-50">
                            {isProfileLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            ) : (
                                <img src={preview || profile?.company_logo_url} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                            )}
                        </div>
                    </div>
                )}
                
                <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
            </CardContent>
        </Card>
    );
};
