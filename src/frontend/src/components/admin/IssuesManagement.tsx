import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, Trash2, Phone, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { loadIssues, updateIssueStatus, deleteIssue, Issue } from '../../lib/issueStorage';

export default function IssuesManagement() {
  const [issues, setIssues] = useState<Issue[]>([]);

  const loadAllIssues = () => {
    const allIssues = loadIssues();
    setIssues(allIssues.sort((a, b) => b.timestamp - a.timestamp));
  };

  useEffect(() => {
    loadAllIssues();

    const handleUpdate = () => {
      loadAllIssues();
    };

    window.addEventListener('issuesUpdated', handleUpdate);
    return () => window.removeEventListener('issuesUpdated', handleUpdate);
  }, []);

  const handleStatusToggle = (issueId: string, currentStatus: 'open' | 'resolved') => {
    const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
    updateIssueStatus(issueId, newStatus);
    loadAllIssues();
    toast.success(`Issue marked as ${newStatus}`);
  };

  const handleDelete = (issueId: string) => {
    deleteIssue(issueId);
    loadAllIssues();
    toast.success('Issue deleted');
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'booking':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'payment':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'property':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'service':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const openIssues = issues.filter(i => i.status === 'open');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
                <p className="text-3xl font-bold text-primary">{issues.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Issues</p>
                <p className="text-3xl font-bold text-red-400">{openIssues.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-green-400">{resolvedIssues.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card shadow-saffron">
        <CardHeader>
          <CardTitle>Reported Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No issues reported</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 rounded-lg border glass-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getCategoryColor(issue.category)}>
                          {issue.category}
                        </Badge>
                        <Badge variant={issue.status === 'open' ? 'destructive' : 'default'}>
                          {issue.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(issue.id, issue.status)}
                          className="text-primary hover:text-primary"
                        >
                          {issue.status === 'open' ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Resolved
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Reopen
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(issue.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {issue.bookingReference && (
                      <div className="mb-2 p-2 rounded bg-primary/10 border border-primary/20">
                        <p className="text-xs font-medium text-primary">
                          Booking: {issue.bookingReference}
                        </p>
                        {issue.homeStayName && (
                          <p className="text-xs text-muted-foreground">{issue.homeStayName}</p>
                        )}
                      </div>
                    )}

                    <p className="text-sm mb-3 whitespace-pre-wrap">{issue.description}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {issue.contactName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${issue.contactPhone}`} className="hover:text-primary">
                          {issue.contactPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatTimestamp(issue.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
