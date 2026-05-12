import { ReactNode } from 'react';

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className="bg-white p-8 rounded shadow-sm hover:shadow-md transition-shadow border border-slate-100 group">
      <div className="w-14 h-14 bg-blue-50 rounded flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
        <div className="text-blue-600 group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
