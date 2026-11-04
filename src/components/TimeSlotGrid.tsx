import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TimeSlot {
    time: string;
    available: boolean;
}

interface TimeSlotGridProps {
    slots: TimeSlot[];
    selectedSlot: string | null;
    onSelect: (time: string) => void;
    formatLabel?: (time: string) => string;
}

export const TimeSlotGrid = ({ slots, selectedSlot, onSelect, formatLabel }: TimeSlotGridProps) => {
    return (
        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
            {slots.map((slot, index) => (
                <Button
                    key={index}
                    variant={selectedSlot === slot.time ? 'default' : slot.available ? 'outline' : 'ghost'}
                    className={`h-auto py-3 transition-colors ${!slot.available
                        ? 'opacity-50 cursor-not-allowed'
                        : selectedSlot === slot.time
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'hover:bg-primary hover:text-white hover:border-primary'
                        }`}
                    disabled={!slot.available}
                    onClick={() => onSelect(slot.time)}
                >
                    <span className="flex items-center justify-center w-full">
                        {slot.available ? (
                            <span className={`w-3 h-3 rounded-full ${selectedSlot === slot.time ? 'bg-white' : 'bg-green-500'} mr-2`}></span>
                        ) : (
                            <X className="w-4 h-4 text-muted-foreground mr-2" />
                        )}
                        {formatLabel ? formatLabel(slot.time) : slot.time}
                    </span>
                </Button>
            ))}
        </div>
    );
};
