import DashboardTable from "@/components/DashboardTable";

interface FoodData {
  _id: string;
  name: string;
  origin: {
    province: string;
    island: string;
    city_or_region: string;
  };
  category?: string;
  course?: string;
  model3D?: string;
}

async function getFoods(): Promise<FoodData[]> {
  try {
    const res = await fetch(`http://localhost:3000/api/foods`, {
      cache: 'no-store', 
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch foods');
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching foods:', error);
    return [];
  }
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const foodsData = await getFoods();
  const itemsPerPage = 8;
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  return (
    <div className="min-h-screen bg-[#F9F5EB]">
      <main className="ml-64 px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black mb-1">Dashboard</h1>
          <p className="text-sm text-gray-600">Kelola data makanan tradisional Indonesia</p>
        </div>
        
        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Table Header Info */}
          <div className="px-5 py-3 bg-[#7C3E2A]">
            <h2 className="text-lg font-semibold text-white">Data Makanan</h2>
            <p className="text-xs text-gray-200 mt-0.5">
              Total {foodsData.length} makanan terdaftar
            </p>
          </div>

          {/* Table with 3D Modal */}
          <DashboardTable 
            foods={foodsData} 
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </main>
    </div>
  );
}
