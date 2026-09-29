"use client";

import { useState } from "react";

type Option = { id: string; name: string };
type SubOption = Option & { category_id: string };

export function CategoryFields({
  categories,
  subcategories,
  defaultCategoryId,
  defaultSubcategoryId,
}: {
  categories: Option[];
  subcategories: SubOption[];
  defaultCategoryId?: string | null;
  defaultSubcategoryId?: string | null;
}) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? "");
  const subs = subcategories.filter((s) => s.category_id === categoryId);
  const subDefault = subs.some((s) => s.id === defaultSubcategoryId) ? (defaultSubcategoryId ?? "") : "";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="f-category_id" className="label">
          Category
        </label>
        <select id="f-category_id" name="category_id" className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-subcategory_id" className="label">
          Subcategory
        </label>
        <select
          key={categoryId}
          id="f-subcategory_id"
          name="subcategory_id"
          className="input"
          defaultValue={subDefault}
          disabled={subs.length === 0}
        >
          <option value="">{subs.length ? "— None —" : "No subcategories"}</option>
          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
