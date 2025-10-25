import React, { useCallback, useState, useEffect, useRef } from 'react';
import { FileUp, Link as LinkIcon, Printer, Trash2, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { usePatientStore } from '@/stores/patientStore';
import { parseExcelFile, parseGoogleSheet } from '@/lib/parser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toaster, toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
const ITEMS_PER_PAGE = 10;
export function HomePage() {
  const patients = usePatientStore((s) => s.patients);
  const selectedPatientIds = usePatientStore((s) => s.selectedPatientIds);
  const isLoading = usePatientStore((s) => s.isLoading);
  const error = usePatientStore((s) => s.error);
  const currentPage = usePatientStore((s) => s.currentPage);
  const headers = usePatientStore((s) => s.headers);
  const labelTemplate = usePatientStore((s) => s.labelTemplate);
  const { setData, setLoading, setError, toggleSelected, toggleSelectAll, clearData, getPrintablePatients, setCurrentPage, setLabelTemplate, resetLabelTemplate } = usePatientStore.getState();
  const [sheetUrl, setSheetUrl] = useState('');
  const templateTextareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    return () => {
      usePatientStore.getState().setError(null);
    };
  }, []);
  const handleDataLoad = useCallback(async (promise: Promise<any[]>) => {
    setLoading(true);
    setError(null);
    try {
      const patientData = await promise;
      if (patientData.length === 0) {
        toast.warning("No data found", { description: "The source is empty or could not be parsed." });
        setData([]);
      } else {
        setData(patientData);
        toast.success("Data loaded successfully", { description: `${patientData.length} records found.` });
      }
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred during parsing.";
      setError(errorMessage);
      toast.error("Failed to load data", { description: errorMessage });
    }
  }, [setData, setError, setLoading]);
  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      handleDataLoad(parseExcelFile(files[0]));
    }
  }, [handleDataLoad]);
  const handleUrlLoad = useCallback(() => {
    if (!sheetUrl) {
      toast.warning("Please enter a Google Sheet URL.");
      return;
    }
    handleDataLoad(parseGoogleSheet(sheetUrl));
  }, [sheetUrl, handleDataLoad]);
  const handlePrint = useCallback(() => {
    const printablePatients = getPrintablePatients();
    if (printablePatients.length > 0) {
      try {
        sessionStorage.setItem('printablePatients', JSON.stringify(printablePatients));
        sessionStorage.setItem('labelTemplate', labelTemplate);
        const printWindow = window.open('/print', '_blank');
        if (!printWindow) {
          toast.error("Could not open print window.", { description: "Please disable your pop-up blocker and try again." });
        }
      } catch (error) {
        toast.error("Failed to prepare print data.", { description: "The selected data might be too large to process." });
      }
    }
  }, [getPrintablePatients, labelTemplate]);
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [handleFileChange]);
  const handlePlaceholderClick = (header: string) => {
    const placeholder = `{{${header}}}`;
    setLabelTemplate(labelTemplate + placeholder);
    toast.info(`"${placeholder}" added to template.`);
    templateTextareaRef.current?.focus();
  };
  const pageCount = Math.ceil(patients.length / ITEMS_PER_PAGE);
  const paginatedPatients = patients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  return (
    <>
      <div className="bg-background min-h-screen text-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">LabelFlow</h1>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
                Import patient data and print 50x30mm labels with ease.
              </p>
            </header>
            <main className="space-y-12">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>1. Import Data</CardTitle>
                  <CardDescription>Upload an Excel file or link a public Google Sheet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="file">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="file">
                        <FileUp className="w-4 h-4 mr-2" /> Upload File
                      </TabsTrigger>
                      <TabsTrigger value="sheet">
                        <LinkIcon className="w-4 h-4 mr-2" /> Google Sheet
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="file" className="pt-6">
                      <div
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        className="relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      >
                        <FileUp className="w-10 h-10 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">
                          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">.xlsx or .csv files</p>
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleFileChange(e.target.files)}
                          accept=".xlsx, .xls, .csv"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="sheet" className="pt-6 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="url"
                          placeholder="https://docs.google.com/spreadsheets/..."
                          value={sheetUrl}
                          onChange={(e) => setSheetUrl(e.target.value)}
                          className="flex-grow"
                        />
                        <Button onClick={handleUrlLoad} disabled={isLoading} className="w-full sm:w-auto">
                          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Load Data
                        </Button>
                      </div>
                       <p className="text-xs text-muted-foreground">Note: Your Google Sheet must be public ("Anyone with the link can view").</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-center p-8 text-muted-foreground"
                  >
                    <Loader2 className="w-8 h-8 mr-4 animate-spin" />
                    <p className="text-lg">Processing data...</p>
                  </motion.div>
                )}
                {error && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center p-4 text-sm rounded-md bg-destructive/10 text-destructive"
                  >
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">An error occurred:</p>
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
                {patients.length > 0 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                  >
                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>2. Design Label</CardTitle>
                          <CardDescription>Create your label template using placeholders from your data.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          resetLabelTemplate();
                          toast.success("Template reset to default.");
                        }}>
                          <RotateCcw className="w-4 h-4 mr-2" /> Reset
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Available Placeholders:</p>
                          <div className="flex flex-wrap gap-2">
                            {headers.map(header => (
                              <Badge variant="secondary" key={header} className="cursor-pointer hover:bg-primary/20" onClick={() => handlePlaceholderClick(header)}>
                                {header}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Textarea
                          ref={templateTextareaRef}
                          placeholder="e.g., Name: {{name}}"
                          value={labelTemplate}
                          onChange={(e) => setLabelTemplate(e.target.value)}
                          rows={4}
                          className="font-mono text-sm"
                        />
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <CardTitle>3. Select Patients</CardTitle>
                            <CardDescription>
                              {selectedPatientIds.size} of {patients.length} selected.
                            </CardDescription>
                          </div>
                          <Button variant="outline" size="sm" onClick={clearData}>
                            <Trash2 className="w-4 h-4 mr-2" /> Clear Data
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50px]">
                                  <Checkbox
                                    checked={selectedPatientIds.size === patients.length && patients.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Select all"
                                  />
                                </TableHead>
                                {headers.map((header, index) => (
                                  <TableHead key={`${header}-${index}`} className="capitalize">{header}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedPatients.length > 0 ? (
                                paginatedPatients.map((patient) => (
                                  <TableRow key={patient.id} data-state={selectedPatientIds.has(patient.id) ? "selected" : ""}>
                                    <TableCell>
                                      <Checkbox
                                        checked={selectedPatientIds.has(patient.id)}
                                        onCheckedChange={() => toggleSelected(patient.id)}
                                        aria-label={`Select patient ${patient.name}`}
                                      />
                                    </TableCell>
                                    {headers.map((header, index) => (
                                      <TableCell key={`${header}-${index}`}>
                                        {patient[header] instanceof Date ? patient[header].toLocaleDateString() : String(patient[header] ?? '')}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={headers.length + 1} className="h-24 text-center">
                                    No patients found.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                        {pageCount > 1 && (
                          <Pagination className="mt-6">
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(Math.max(1, currentPage - 1)); }} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                              </PaginationItem>
                              {[...Array(pageCount).keys()].map(num => (
                                <PaginationItem key={num}>
                                  <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(num + 1); }} isActive={currentPage === num + 1}>
                                    {num + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(Math.min(pageCount, currentPage + 1)); }} aria-disabled={currentPage === pageCount} className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""} />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        )}
                      </CardContent>
                    </Card>
                    <div className="mt-8 flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div tabIndex={selectedPatientIds.size === 0 ? 0 : -1}>
                              <Button size="lg" onClick={handlePrint} disabled={selectedPatientIds.size === 0}>
                                <Printer className="w-5 h-5 mr-2" />
                                Print {selectedPatientIds.size} Selected Label{selectedPatientIds.size !== 1 && 's'}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {selectedPatientIds.size === 0 && (
                            <TooltipContent>
                              <p>Select at least one patient to print.</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
            <footer className="text-center mt-16 text-sm text-muted-foreground">
              <p>Built with ��️ at Cloudflare</p>
            </footer>
          </div>
        </div>
      </div>
      <Toaster richColors closeButton />
    </>
  );
}