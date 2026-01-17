export interface FieldTaxonomy {
  id: number;
  nama: string;
  parent_id: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NestedFieldTaxonomy {
  id: number;
  nama: string;
  parent_id: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  nested_children: NestedFieldTaxonomy[];
}
