import { builder, Builder } from "@builder.io/react";

// Initialize Builder.io with your API key
builder.init("5b806968341544aba5536912ecced3e1");

// Register custom components ให้ Builder.io ใช้ drag & drop ได้
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

Builder.registerComponent(Card, {
  name: "Card",
  inputs: [
    { name: "className", type: "string", defaultValue: "p-6 border border-slate-200" },
  ],
});

Builder.registerComponent(Button, {
  name: "Button",
  inputs: [
    { name: "children", type: "string", defaultValue: "คลิก" },
    { name: "className", type: "string", defaultValue: "" },
    { name: "variant", type: "string", enum: ["default", "destructive", "outline", "secondary", "ghost", "link"], defaultValue: "default" },
  ],
});

export default builder;
