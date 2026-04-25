import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DownloadCloud, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function Reports() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    const input = document.getElementById('report-section');
    if (!input) {
      console.error('Target element "report-section" not found.');
      return;
    }

    try {
      // Add a small delay to ensure all DOM updates and styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: true, // Enable logging for debugging on deployed site
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If content is taller than one page, it will be cropped or scaled differently.
      // Scaling to fit width on a single A4 page. 
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('construction_projects_report.pdf');
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  if (loading) return <div className="text-center py-20 font-medium text-slate-500">Loading Report Data...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Executive Reports
          </h1>
          <p className="text-slate-500 mt-2">Comprehensive summary of all project statuses and financials.</p>
        </div>
        <button onClick={exportPDF} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all focus:ring-4 focus:ring-blue-100">
          <DownloadCloud className="w-5 h-5"/> Export to PDF
        </button>
      </div>

      {/* Wrapping the content to be exported in a ref and id */}
      <div id="report-section" ref={reportRef} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        {/* Export Header visible only on PDF (optional, but good for context) */}
        <div className="hidden pdf-header mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">Construction Projects Master Report</h2>
          <p className="text-sm text-slate-500">Generated on: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Dashboard-lite summaries for the report */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60">
              <span className="text-xs font-bold uppercase text-slate-500 mb-1 block">Total Portfolio Value</span>
              <span className="text-3xl font-black text-slate-900">${projects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()}</span>
           </div>
           <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60 flex flex-col justify-center">
              <div className="flex justify-between items-end mb-2">
                 <span className="text-xs font-bold uppercase text-slate-500">Overall Completion</span>
                 <span className="text-2xl font-black text-slate-900">
                   {(projects.reduce((acc, p) => acc + (p.completionPercentage || 0), 0) / (projects.length || 1)).toFixed(1)}%
                 </span>
              </div>
           </div>
           <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60">
              <span className="text-xs font-bold uppercase text-slate-500 mb-1 block">Total Capital Deployed</span>
              <span className="text-3xl font-black text-slate-900">${projects.reduce((acc, p) => acc + (p.totalExpense || 0), 0).toLocaleString()}</span>
           </div>
        </div>

        {/* List layout optimized for reading */}
        <div className="rounded-xl border border-slate-200/60 overflow-hidden">
          <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider font-bold">
                 <th className="p-4 py-3">Project</th>
                 <th className="p-4 py-3 text-center">Status</th>
                 <th className="p-4 py-3 w-1/4">Progress</th>
                 <th className="p-4 py-3 text-right">Budget Details</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100/80">
               {projects.map(p => (
                 <tr key={p._id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="p-4 align-top">
                       <h3 className="font-bold text-slate-900">{p.projectName}</h3>
                       <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.description}</p>
                    </td>
                    <td className="p-4 align-top text-center w-32">
                       <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${p.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : p.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {p.status === 'Completed' ? <CheckCircle2 className="w-3 h-3"/> : p.status === 'In Progress' ? <Clock className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                          {p.status}
                       </span>
                    </td>
                    <td className="p-4 align-top">
                       <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>{p.status}</span>
                          <span>{(p.completionPercentage || 0).toFixed(0)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${p.completionPercentage === 100 ? 'bg-green-500' : 'bg-slate-800'}`} style={{ width: `${p.completionPercentage || 0}%` }} />
                       </div>
                    </td>
                    <td className="p-4 align-top text-right">
                       <p className="font-bold text-slate-900">${(p.totalExpense || 0).toLocaleString()} <span className="text-slate-400 font-normal text-xs">spent</span></p>
                       <p className="text-xs text-slate-500 mt-1">/ ${p.budget.toLocaleString()} total</p>
                    </td>
                 </tr>
               ))}
               {projects.length === 0 && (
                 <tr>
                    <td colSpan="4" className="text-center py-10 font-medium text-slate-500">No projects data available.</td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
