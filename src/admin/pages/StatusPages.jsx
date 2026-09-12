import { Link } from 'react-router-dom';
import { FileQuestion, Lock } from 'lucide-react';
import { EmptyState, Button, Card } from '../ui/primitives';
import { useAuth } from '../auth/AuthProvider';
import { roleMeta } from '../../lib/collections';

export function NotFoundPage() {
  return (
    <Card>
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="That admin section does not exist. It may have been renamed."
        action={
          <Button as={Link} to="/admin" variant="primary">
            Back to overview
          </Button>
        }
      />
    </Card>
  );
}

export function NoAccessPage() {
  const { profile } = useAuth();
  const role = roleMeta(profile?.role);

  return (
    <Card>
      <EmptyState
        icon={Lock}
        title="You do not have access to this section"
        description={`Your account has the “${role.label}” role: ${role.description} Ask an owner to change your role if you need access.`}
        action={
          <Button as={Link} to="/admin" variant="primary">
            Back to overview
          </Button>
        }
      />
    </Card>
  );
}
