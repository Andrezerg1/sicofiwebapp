import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileSpreadsheet, Trash2, Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SpreadsheetData {
  id: string;
  name: string;
  description: string | null;
  color: string;
  is_default: boolean;
  created_at: string;
  transaction_count?: number;
  total_income?: number;
  total_expense?: number;
}

export default function Spreadsheets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sheets, setSheets] = useState<SpreadsheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [sheetTransactions, setSheetTransactions] = useState<any[]>([]);

  const fetchSheets = async () => {
    if (!user) return;
    const { data: sheetsData } = await supabase
      .from('spreadsheets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!sheetsData) { setLoading(false); return; }

    const enriched = await Promise.all(sheetsData.map(async (s) => {
      const { data: txs } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('spreadsheet_id', s.id);
      const txList = txs || [];
      return {
        ...s,
        transaction_count: txList.length,
        total_income: txList.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
        total_expense: txList.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0),
      };
    }));

    setSheets(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchSheets(); }, [user]);

  const handleCreate = async () => {
    if (!user || !name) return;
    const { error } = await supabase.from('spreadsheets').insert({
      user_id: user.id,
      name,
      description: description || null,
    });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Planilha criada!' });
    setDialogOpen(false);
    setName('');
    setDescription('');
    fetchSheets();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('spreadsheets').delete().eq('id', id);
    toast({ title: 'Planilha excluída' });
    if (selectedSheet === id) setSelectedSheet(null);
    fetchSheets();
  };

  const openSheet = async (id: string) => {
    setSelectedSheet(id);
    const { data } = await supabase
      .from('transactions')
      .select('*, categories(name, icon)')
      .eq('spreadsheet_id', id)
      .order('date', { ascending: false });
    setSheetTransactions(data || []);
  };

  const exportExcel = () => {
    const sheet = sheets.find(s => s.id === selectedSheet);
    const wsData = sheetTransactions.map(t => ({
      Data: formatDate(t.date),
      Descrição: t.description,
      Categoria: t.categories?.name || 'Sem categoria',
      Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
      Valor: Number(t.amount),
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheet?.name || 'Planilha');
    XLSX.writeFile(wb, `${sheet?.name || 'planilha'}.xlsx`);
    toast({ title: 'Exportado para Excel!' });
  };

  const exportPDF = () => {
    const sheet = sheets.find(s => s.id === selectedSheet);
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(sheet?.name || 'Planilha', 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    autoTable(doc, {
      startY: 36,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: sheetTransactions.map(t => [
        formatDate(t.date),
        t.description,
        t.categories?.name || 'Sem categoria',
        t.type === 'income' ? 'Receita' : 'Despesa',
        formatCurrency(Number(t.amount)),
      ]),
    });

    doc.save(`${sheet?.name || 'planilha'}.pdf`);
    toast({ title: 'Exportado para PDF!' });
  };

  if (selectedSheet) {
    const sheet = sheets.find(s => s.id === selectedSheet);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Button variant="ghost" onClick={() => setSelectedSheet(null)} className="mb-2">← Voltar</Button>
            <h1 className="text-3xl font-bold">{sheet?.name}</h1>
            <p className="text-muted-foreground">{sheetTransactions.length} transações</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportExcel}><Download className="h-4 w-4 mr-2" /> Excel</Button>
            <Button variant="outline" onClick={exportPDF}><FileText className="h-4 w-4 mr-2" /> PDF</Button>
          </div>
        </div>

        <Card className="glass">
          <CardContent className="p-0">
            {sheetTransactions.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">Nenhuma transação nesta planilha</p>
            ) : (
              <div className="divide-y divide-border">
                {sheetTransactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{t.categories?.icon || '💸'}</span>
                      <div>
                        <p className="font-medium text-sm">{t.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${t.type === 'income' ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Planilhas</h1>
          <p className="text-muted-foreground">Organize suas finanças em múltiplas planilhas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary"><Plus className="h-4 w-4 mr-2" /> Nova Planilha</Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Nova Planilha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Viagem 2026" />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição da planilha" />
              </div>
              <Button className="w-full gradient-primary" onClick={handleCreate}>Criar Planilha</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map(s => (
            <Card key={s.id} className="glass cursor-pointer hover:shadow-lg transition-all group" onClick={() => openSheet(s.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                      <FileSpreadsheet className="h-4 w-4" style={{ color: s.color }} />
                    </div>
                    <CardTitle className="text-base">{s.name}</CardTitle>
                  </div>
                  {!s.is_default && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); handleDelete(s.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{s.transaction_count} transações</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(var(--income))]">+{formatCurrency(s.total_income || 0)}</span>
                    <span className="text-[hsl(var(--expense))]">-{formatCurrency(s.total_expense || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
