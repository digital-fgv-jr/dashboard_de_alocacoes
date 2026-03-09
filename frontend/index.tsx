import React from "react";
import { initializeBlock } from "@airtable/blocks/ui";
import AppBoot from "./src/app/AppBoot";

initializeBlock(() => <AppBoot />);