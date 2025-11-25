import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Participant } from '@/types/participant.types'

interface CityDetailModalProps {
  city: string
  state: string
  participants: Participant[]
  isOpen: boolean
  onClose: () => void
}

export function CityDetailModal({
  city,
  state,
  participants,
  isOpen,
  onClose,
}: CityDetailModalProps) {
  const totalClasses = participants.reduce((sum, p) => sum + (p['Classes Taken'] || 0), 0)
  const activeCount = participants.filter((p) => p.ParticipantStatusID === 1).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {city}, {state}
          </DialogTitle>
          <DialogDescription>Detailed city statistics and participant list</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* City Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Participants</div>
              <div className="text-2xl font-bold">{participants.length}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-2xl font-bold">{activeCount}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Total Classes</div>
              <div className="text-2xl font-bold">{totalClasses}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Avg Classes</div>
              <div className="text-2xl font-bold">
                {participants.length > 0 ? (totalClasses / participants.length).toFixed(1) : 0}
              </div>
            </div>
          </div>

          {/* Participant List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Participants from {city}</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map((participant) => {
                const fullName = [
                  participant.Prefix,
                  participant['First Name'],
                  participant['Middle Name'],
                  participant['Last Name'],
                  participant.Suffix,
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <div
                    key={participant['DAS Number']}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{fullName || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          DAS: {participant['DAS Number']}
                          {participant.Company && ` • ${participant.Company}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={participant.ParticipantStatusID === 1 ? 'success' : 'secondary'}>
                          {participant.ParticipantStatusID === 1 ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm">
                          {participant['Classes Taken'] || 0} classes
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

