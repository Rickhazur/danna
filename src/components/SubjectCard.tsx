import { Card, CardContent } from "@/components/ui/card";

interface SubjectCardProps {
  name: string;
  icon: string;
  description: string;
  color: string;
  progress?: number;
  onClick: () => void;
}

const SubjectCard = ({ name, icon, description, color, progress = 0, onClick }: SubjectCardProps) => {
  return (
    <Card
      className="cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg border-2 border-transparent hover:border-primary/30 group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="text-3xl w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg leading-tight">{name}</h3>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{description}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-semibold" style={{ color }}>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: color }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
