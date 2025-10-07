import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const PromptDialog = ({
  open,
  title = 'Please confirm',
  description = '',
  label = 'Value',
  placeholder = '',
  defaultValue = '',
  type = 'textarea', // 'textarea' | 'input'
  confirmLabel = 'Submit',
  cancelLabel = 'Cancel',
  loading = false,
  autoFocus = true,
  onSubmit,
  onClose,
}) => {
  const [value, setValue] = useState(defaultValue || '');

  useEffect(() => {
    if (open) setValue(defaultValue || '');
  }, [open, defaultValue]);

  const handleSubmit = () => {
    if (onSubmit) onSubmit(value);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description && (
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
        )}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          {type === 'textarea' ? (
            <Textarea
              autoFocus={autoFocus}
              rows={4}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <Input
              autoFocus={autoFocus}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDialog;
