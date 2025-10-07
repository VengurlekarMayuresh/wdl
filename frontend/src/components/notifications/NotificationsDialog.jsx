import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, RefreshCw, XCircle, Bell } from 'lucide-react';
import { appointmentsAPI } from '@/services/api';
import { buildNotificationsFromAppointments, getLastSeen, setLastSeen, getSeenIds, addSeenIds } from '@/services/notifications';
import { useNavigate } from 'react-router-dom';

const kindToBadge = (kind) => {
  switch (kind) {
    case 'request': return { variant: 'warning', label: 'Request' };
    case 'confirmed': return { variant: 'success', label: 'Confirmed' };
    case 'rejected': return { variant: 'destructive', label: 'Rejected' };
    case 'cancelled': return { variant: 'destructive', label: 'Cancelled' };
    case 'completed': return { variant: 'secondary', label: 'Completed' };
    default: return { variant: 'secondary', label: 'Update' };
  }
};

const NotificationsDialog = ({ open, onClose, userType = 'patient', userId, onUpdated }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const appts = userType === 'doctor'
        ? await appointmentsAPI.getDoctorAppointments('all')
        : await appointmentsAPI.getMyAppointments('all');
      const list = buildNotificationsFromAppointments(appts || [], userType === 'doctor' ? 'doctor' : 'patient');
      setItems(list);
      onUpdated?.(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userType]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(i => i.kind === filter);
  }, [items, filter]);

  const [lastSeenTs, setLastSeenTs] = useState(getLastSeen(userId)?.getTime?.() || 0);

  useEffect(() => {
    // If user id changes, refresh last seen snapshot
    setLastSeenTs(getLastSeen(userId)?.getTime?.() || 0);
  }, [userId]);

  const unreadCount = useMemo(() => {
    const seen = getSeenIds(userId);
    return (items || []).filter(i => !seen.has(i.id)).length;
  }, [items, userId]);

  const markAllRead = () => {
    const now = new Date();
    setLastSeen(userId, now);
    setLastSeenTs(now.getTime());
    addSeenIds(userId, (items || []).map(i => i.id));
    onUpdated?.(items);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">{unreadCount} new</Badge>
              )}
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-3">
          {['all','request','confirmed','rejected','cancelled','completed'].map(key => (
            <Button key={key} size="sm" variant={filter === key ? 'default' : 'outline'} onClick={() => setFilter(key)} className="capitalize">
              {key}
            </Button>
          ))}
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-60" />
              No notifications
            </div>
          ) : (
            filtered.map((n) => {
              const badge = kindToBadge(n.kind);
              const goTo = userType === 'doctor' ? '/doctor-appointments' : '/patient-appointments';
              return (
                <div
                  key={n.id}
                  className="p-3 border rounded-md flex items-start justify-between hover:bg-accent/30 cursor-pointer"
                  onClick={() => {
                    // mark this notification as seen and redirect
                    addSeenIds(userId, [n.id]);
                    onUpdated?.(items);
                    onClose?.();
                    navigate(goTo);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {n.kind === 'request' ? <Clock className="h-4 w-4 text-yellow-600" /> :
                       n.kind === 'confirmed' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                       n.kind === 'rejected' ? <XCircle className="h-4 w-4 text-red-600" /> :
                       n.kind === 'cancelled' ? <XCircle className="h-4 w-4 text-red-600" /> :
                       <Calendar className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <div className="font-medium">{n.title}</div>
                      <div className="text-sm text-muted-foreground">{n.message}</div>
                      {n.date && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {n.date.toLocaleDateString()} • {n.date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={badge.variant} className="text-xs self-start">{badge.label}</Badge>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;