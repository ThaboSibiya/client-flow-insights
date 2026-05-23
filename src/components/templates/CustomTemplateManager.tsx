
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useSecureTemplates } from '@/hooks/useSecureTemplates';
import TemplateBuilder from './builder/TemplateBuilder';
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import { securityMonitoringService } from '@/services/secureSecurityService';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type ViewMode = 'list' | 'builder' | 'edit';

const CustomTemplateManager: React.FC = () => {
  const { user } = useAuth();
  const { templates, isLoading, deleteTemplate, isDeleting } = useSecureTemplates();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleCreateNew = useCallback(() => {
    setSelectedTemplate(null);
    setViewMode('builder');
  }, []);

  const handleEdit = useCallback(async (template: any) => {
    if (user) {
      await securityMonitoringService.logTemplateAccess(template.id, user.id, 'view');
    }
    setSelectedTemplate(template);
    setViewMode('edit');
  }, [user]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteTemplate(deleteTarget.id);
      if (user) {
        await securityMonitoringService.logTemplateAccess(deleteTarget.id, user.id, 'delete');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTemplate, deleteTarget, user]);

  const handleBack = useCallback(() => {
    setSelectedTemplate(null);
    setViewMode('list');
  }, []);

  if (viewMode === 'builder' || viewMode === 'edit') {
    return (
      <TemplateBuilder 
        onBack={handleBack}
        existingTemplate={selectedTemplate}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Custom Templates</h2>
          <p className="text-sm text-muted-foreground">
            Manage your industry templates
          </p>
        </div>
        <Button size="sm" onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Template
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="flex-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 mb-3 bg-muted rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground mb-1">No templates yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first template to get started
          </p>
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center gap-3 px-4 py-3 bg-background hover:bg-muted/50 transition-colors group"
            >
              {/* Name + Industry */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-foreground truncate">
                  {template.name}
                </p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {template.industry.replace(/_/g, ' ')}
                </p>
              </div>

              {/* Description (hidden on small screens) */}
              <p className="hidden md:block text-xs text-muted-foreground truncate max-w-[200px]">
                {template.description || '—'}
              </p>

              {/* Version badge */}
              <Badge variant="secondary" className="text-[10px] shrink-0">
                v{template.version}
              </Badge>

              {/* Actions — visible on hover / always on mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity data-[state=open]:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => handleEdit(template)}>
                    <Edit className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteTarget({ id: template.id, name: template.name })}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomTemplateManager;
