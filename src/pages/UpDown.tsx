
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpIcon, ArrowDownIcon, SearchIcon, BarChartIcon, FilterIcon, RefreshCwIcon,  BuildingIcon, BanIcon, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader } from "@/components/ui/loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface StockUpgrade {
  id: string;
  firm: string;
  to_grade: string;
  from_grade: string;
  grade_date: string;
  action: string;
  symbol: string;
  created_at: string;
}

const UpDown: React.FC = () => {
  const [upgrades, setUpgrades] = useState<StockUpgrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchUpgrades();
  }, [currentPage, pageSize]);

  const fetchUpgrades = async () => {
    try {
      setIsLoading(true);
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from("stock_upgrades")
        .select("*", { count: "exact", head: true });
      
      if (countError) {
        throw countError;
      }
      
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / pageSize));
      
      // Fetch the data with pagination
      const { data, error } = await supabase
        .from("stock_upgrades")
        .select("*")
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) {
        throw error;
      }

      setUpgrades(data || []);
    } catch (err: any) {
      console.error("Error fetching stock upgrades:", err);
      setError(err.message || "Failed to load stock upgrades");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUpgrades();
  };

  const filteredUpgrades = upgrades.filter((upgrade) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      upgrade.symbol.toLowerCase().includes(searchLower) ||
      upgrade.firm.toLowerCase().includes(searchLower) ||
      upgrade.action.toLowerCase().includes(searchLower)
    );
  });

  const getActionIcon = (action: string) => {
    if (action.toLowerCase() === "upgrade" || action.toLowerCase() === "up") {
      return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
    } else if (action.toLowerCase() === "downgrade" || action.toLowerCase() === "down") {
      return <ArrowDownIcon className="h-5 w-5 text-red-500" />;
    } else if (action.toLowerCase() === "reiterate" || action.toLowerCase() === "reit" || action.toLowerCase() === "main") {
      return <RefreshCwIcon className="h-5 w-5 text-blue-500" />;
    }
    return null;
  };

  const getActionColor = (action: string) => {
    if (action.toLowerCase() === "upgrade" || action.toLowerCase() === "up") {
      return "text-green-700 bg-green-100 px-2 py-1 rounded-md";
    } else if (action.toLowerCase() === "downgrade" || action.toLowerCase() === "down") {
      return "text-red-700 bg-red-100 px-2 py-1 rounded-md";
    } else if (action.toLowerCase() === "reiterate" || action.toLowerCase() === "reit" || action.toLowerCase() === "main") {
      return "text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md";
    }
    
    return "";
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}
          
          {pages}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background w-full">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Stock Upgrades & Downgrades</h1>
          <p className="text-muted-foreground">
            Track analyst rating changes for your favorite stocks
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-auto">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by symbol, firm, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[300px]"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm whitespace-nowrap">Rows per page:</label>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-[100px]" id="page-size">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh data">
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-2">
          {isLoading ? "Loading..." : `Showing ${filteredUpgrades.length} of ${totalItems} entries`}
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader message="Loading stock upgrades..." />
          </div>
        ) : error ? (
          <div className="text-center my-12 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border shadow">
            <Table className="border rounded-lg shadow-sm">
  <TableCaption className="text-muted-foreground text-sm">
    📊 Stock Analyst Rating Changes & Price Target Updates
  </TableCaption>
  <TableHeader>
    <TableRow className="bg-muted/40">
      <TableHead className="min-w-[120px] px-4 py-2">
        <div className="flex items-center gap-1">
          <FilterIcon className="h-4 w-4 text-blue-500" /> Symbol
        </div>
      </TableHead>
      <TableHead className="px-4 py-2">
        <div className="flex items-center gap-1">
          <BuildingIcon className="h-4 w-4 text-indigo-500" /> Firm
        </div>
      </TableHead>
      <TableHead className="px-4 py-2">
        <div className="flex items-center gap-1">
          <ArrowDownIcon className="h-4 w-4 text-red-500" /> From
        </div>
      </TableHead>
      <TableHead className="px-4 py-2">
        <div className="flex items-center gap-1">
          <ArrowUpIcon className="h-4 w-4 text-green-500" /> To
        </div>
      </TableHead>
      <TableHead className="px-4 py-2">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-gray-500" /> Date
        </div>
      </TableHead>
      <TableHead className="px-4 py-2">
        <div className="flex items-center gap-1">
          <BuildingIcon className="h-4 w-4 text-yellow-500" /> Action
        </div>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredUpgrades.length === 0 ? (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-6 text-gray-500">
          <span className="flex flex-col items-center gap-2">
            <BanIcon className="h-6 w-6 text-gray-400" />
            No upgrades found matching your search.
          </span>
        </TableCell>
      </TableRow>
    ) : (
      filteredUpgrades.map((upgrade) => (
        <TableRow
          key={upgrade.id}
          className="odd:bg-muted/20 hover:bg-muted/40 transition"
        >
          <TableCell className="px-4 py-2 font-medium">{upgrade.symbol}</TableCell>
          <TableCell className="px-4 py-2">{upgrade.firm}</TableCell>
          <TableCell className="px-4 py-2 text-red-500">{upgrade.from_grade}</TableCell>
          <TableCell className="px-4 py-2 text-green-500">{upgrade.to_grade}</TableCell>
          <TableCell className="px-4 py-2">{upgrade.grade_date}</TableCell>
          <TableCell className="px-4 py-2">
            <div className="flex items-center gap-2">
              {getActionIcon(upgrade.action)}
              <span className={cn(getActionColor(upgrade.action), "font-medium")}>{
                upgrade.action
              }</span>
            </div>
          </TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>


          </div>
        )}

        {!isLoading && !error && totalPages > 1 && renderPagination()}
      </main>
    </div>
  );
};

export default UpDown;
