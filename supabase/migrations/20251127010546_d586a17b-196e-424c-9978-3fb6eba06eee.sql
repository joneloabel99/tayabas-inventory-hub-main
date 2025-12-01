-- Create enum for movement types
CREATE TYPE public.movement_type AS ENUM ('received', 'issued');

-- Create items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code TEXT NOT NULL UNIQUE,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit TEXT NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock movements table
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  movement_type public.movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reference TEXT NOT NULL,
  custodian TEXT,
  department TEXT,
  purpose TEXT,
  movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custodians table
CREATE TABLE public.custodians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custodians ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items
CREATE POLICY "Everyone can view items" ON public.items
  FOR SELECT USING (true);

CREATE POLICY "Staff and above can insert items" ON public.items
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    public.has_role(auth.uid(), 'manager'::app_role) OR
    public.has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and above can update items" ON public.items
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    public.has_role(auth.uid(), 'manager'::app_role) OR
    public.has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admin can delete items" ON public.items
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for stock_movements
CREATE POLICY "Everyone can view movements" ON public.stock_movements
  FOR SELECT USING (true);

CREATE POLICY "Staff and above can insert movements" ON public.stock_movements
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    public.has_role(auth.uid(), 'manager'::app_role) OR
    public.has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admin can delete movements" ON public.stock_movements
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for custodians
CREATE POLICY "Everyone can view custodians" ON public.custodians
  FOR SELECT USING (true);

CREATE POLICY "Staff and above can manage custodians" ON public.custodians
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    public.has_role(auth.uid(), 'manager'::app_role) OR
    public.has_role(auth.uid(), 'staff'::app_role)
  );

-- Create indexes for better performance
CREATE INDEX idx_items_item_code ON public.items(item_code);
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_stock_movements_item_id ON public.stock_movements(item_id);
CREATE INDEX idx_stock_movements_date ON public.stock_movements(movement_date);
CREATE INDEX idx_custodians_department ON public.custodians(department);

-- Create trigger for updating timestamps
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_custodians_updated_at
  BEFORE UPDATE ON public.custodians
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create function to automatically update item quantity
CREATE OR REPLACE FUNCTION public.update_item_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.movement_type = 'received' THEN
    UPDATE public.items
    SET quantity = quantity + NEW.quantity
    WHERE id = NEW.item_id;
  ELSIF NEW.movement_type = 'issued' THEN
    UPDATE public.items
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update item quantity on stock movement
CREATE TRIGGER update_quantity_on_movement
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_item_quantity();