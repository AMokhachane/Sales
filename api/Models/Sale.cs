using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    public class Sale
    {
        public int SaleId { get; set; }
        public decimal SalePrice { get; set; }
        public int SaleQty { get; set; }

        public DateOnly SaleDate { get; set; }
        public int? ProductId { get; set; }

        public Product? Product { get; set; }
    }
}