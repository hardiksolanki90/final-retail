# Database Structure

> Generated from the `final_retail_laravel` schema by `php artisan schema:markdown` (final-retail-laravel) on 2026-10-05.
> Do not edit by hand — run the command again after migrations.

83 tables.

## Contents

- [areas](#areas)
- [bank_information](#bank_information)
- [beats](#beats)
- [brands](#brands)
- [cache](#cache)
- [cache_locks](#cache_locks)
- [channels](#channels)
- [code_settings](#code_settings)
- [consumer_surveys](#consumer_surveys)
- [countries](#countries)
- [country_masters](#country_masters)
- [credit_note_details](#credit_note_details)
- [credit_notes](#credit_notes)
- [currencies](#currencies)
- [currency_masters](#currency_masters)
- [customer_categories](#customer_categories)
- [customer_groups](#customer_groups)
- [customer_types](#customer_types)
- [customers](#customers)
- [debit_note_details](#debit_note_details)
- [debit_notes](#debit_notes)
- [deliveries](#deliveries)
- [delivery_details](#delivery_details)
- [depots](#depots)
- [divisions](#divisions)
- [document_line_taxes](#document_line_taxes)
- [driver_and_van_swapings](#driver_and_van_swapings)
- [failed_jobs](#failed_jobs)
- [good_receipt_note_details](#good_receipt_note_details)
- [good_receipt_notes](#good_receipt_notes)
- [invoice_details](#invoice_details)
- [invoices](#invoices)
- [item_categories](#item_categories)
- [item_groups](#item_groups)
- [item_main_prices](#item_main_prices)
- [item_uoms](#item_uoms)
- [items](#items)
- [job_batches](#job_batches)
- [jobs](#jobs)
- [journey_plan_customers](#journey_plan_customers)
- [journey_plans](#journey_plans)
- [merchandiser_replacements](#merchandiser_replacements)
- [migrations](#migrations)
- [model_has_permissions](#model_has_permissions)
- [model_has_roles](#model_has_roles)
- [order_details](#order_details)
- [orders](#orders)
- [organisations](#organisations)
- [outlet_product_codes](#outlet_product_codes)
- [pallets](#pallets)
- [password_reset_tokens](#password_reset_tokens)
- [payment_terms](#payment_terms)
- [pdp_items](#pdp_items)
- [pdp_key_combinations](#pdp_key_combinations)
- [pdp_plans](#pdp_plans)
- [pdp_slabs](#pdp_slabs)
- [pdp_values](#pdp_values)
- [permissions](#permissions)
- [personal_access_tokens](#personal_access_tokens)
- [product_catalogs](#product_catalogs)
- [reason_types](#reason_types)
- [regions](#regions)
- [role_has_permissions](#role_has_permissions)
- [roles](#roles)
- [routes](#routes)
- [sales_organisations](#sales_organisations)
- [salesman_infos](#salesman_infos)
- [salesman_load_details](#salesman_load_details)
- [salesman_loads](#salesman_loads)
- [salesman_unload_details](#salesman_unload_details)
- [salesman_unloads](#salesman_unloads)
- [sensory_surveys](#sensory_surveys)
- [sessions](#sessions)
- [tax_rates](#tax_rates)
- [user_credit_limits](#user_credit_limits)
- [users](#users)
- [van_categories](#van_categories)
- [van_types](#van_types)
- [vans](#vans)
- [warehouses](#warehouses)
- [work_flow_rule_approvers](#work_flow_rule_approvers)
- [work_flow_rules](#work_flow_rules)
- [zones](#zones)

## areas

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `area_code` | `varchar(50)` | yes | `NULL` |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `parent_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `area_name` | `varchar(191)` | no | — |  |
| `node_level` | `bigint(20)` | no | `0` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `areas_organisation_id_foreign` (organisation_id)
- index `areas_parent_id_foreign` (parent_id)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (parent_id) → `areas`(id) on update restrict, on delete restrict

## bank_information

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `bank_code` | `varchar(191)` | no | — |  |
| `bank_name` | `varchar(191)` | no | — |  |
| `bank_address` | `varchar(191)` | no | — |  |
| `account_number` | `varchar(191)` | no | — |  |
| `iban` | `varchar(255)` | yes | `NULL` |  |
| `swift_code` | `varchar(255)` | yes | `NULL` |  |
| `ifsc_code` | `varchar(255)` | yes | `NULL` |  |
| `routing_number` | `varchar(255)` | yes | `NULL` |  |
| `sort_code` | `varchar(255)` | yes | `NULL` |  |
| `branch_name` | `varchar(255)` | yes | `NULL` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `bank_information_organisation_id_foreign` (organisation_id)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## beats

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `area_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `beat_code` | `varchar(50)` | no | — |  |
| `beat_name` | `varchar(191)` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `beats_area_id_foreign` (area_id)
- index `beats_organisation_id_foreign` (organisation_id)
- unique `beats_uuid_unique` (uuid)
- primary `primary` (id)

**Foreign keys**

- (area_id) → `areas`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## brands

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `parent_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `brand_name` | `varchar(191)` | no | — |  |
| `description` | `varchar(191)` | yes | `NULL` |  |
| `logo_url` | `varchar(300)` | yes | `NULL` |  |
| `node_level` | `bigint(20)` | no | `0` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `brands_organisation_id_foreign` (organisation_id)
- index `brands_parent_id_foreign` (parent_id)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (parent_id) → `brands`(id) on update restrict, on delete cascade

## cache

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `key` | `varchar(255)` | no | — |  |
| `value` | `mediumtext` | no | — |  |
| `expiration` | `bigint(20)` | no | — |  |

**Indexes**

- index `cache_expiration_index` (expiration)
- primary `primary` (key)

## cache_locks

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `key` | `varchar(255)` | no | — |  |
| `owner` | `varchar(255)` | no | — |  |
| `expiration` | `bigint(20)` | no | — |  |

**Indexes**

- index `cache_locks_expiration_index` (expiration)
- primary `primary` (key)

## channels

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `parent_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `name` | `varchar(191)` | no | — |  |
| `node_level` | `bigint(20)` | no | `0` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `channels_organisation_id_status_index` (organisation_id, status)
- unique `channels_organisation_id_uuid_unique` (organisation_id, uuid)
- index `channels_parent_id_foreign` (parent_id)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (parent_id) → `channels`(id) on update restrict, on delete restrict

## code_settings

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `entity_key` | `varchar(50)` | no | — |  |
| `is_code_auto` | `tinyint(1)` | no | `1` |  |
| `prefix_code` | `varchar(20)` | yes | `NULL` |  |
| `start_code` | `varchar(20)` | yes | `NULL` |  |
| `next_coming_number` | `varchar(50)` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- unique `code_settings_organisation_id_entity_key_unique` (organisation_id, entity_key)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete cascade

## consumer_surveys

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `survey_code` | `varchar(191)` | no | — |  |
| `survey_name` | `varchar(191)` | no | — |  |
| `customer_id` | `bigint(20) unsigned` | no | — |  |
| `salesman_id` | `bigint(20) unsigned` | no | — |  |
| `date` | `date` | no | — |  |
| `questions` | `longtext` | yes | `NULL` |  |
| `status` | `enum('draft','completed')` | no | `'draft'` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `consumer_surveys_customer_id_foreign` (customer_id)
- index `consumer_surveys_organisation_id_status_index` (organisation_id, status)
- unique `consumer_surveys_organisation_id_survey_code_unique` (organisation_id, survey_code)
- unique `consumer_surveys_organisation_id_uuid_unique` (organisation_id, uuid)
- index `consumer_surveys_salesman_id_foreign` (salesman_id)
- primary `primary` (id)

**Foreign keys**

- (customer_id) → `customers`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict

## countries

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `country_master_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `name` | `varchar(191)` | no | — |  |
| `country_code` | `varchar(10)` | no | — |  |
| `dial_code` | `varchar(10)` | yes | `NULL` |  |
| `currency` | `varchar(50)` | no | — |  |
| `currency_code` | `varchar(10)` | yes | `NULL` |  |
| `currency_symbol` | `varchar(50)` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `countries_country_master_id_foreign` (country_master_id)
- index `countries_organisation_id_foreign` (organisation_id)
- primary `primary` (id)

**Foreign keys**

- (country_master_id) → `country_masters`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## country_masters

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `name` | `varchar(255)` | no | — |  |
| `dial_code` | `varchar(10)` | no | — |  |
| `country_code` | `varchar(10)` | no | — |  |
| `currency` | `varchar(255)` | no | — |  |
| `currency_code` | `varchar(10)` | no | — |  |
| `currency_symbol` | `varchar(50)` | no | — |  |
| `alpha3` | `varchar(10)` | yes | `NULL` |  |
| `tax_system` | `varchar(191)` | yes | `NULL` |  |
| `tax_engine` | `varchar(100)` | yes | `NULL` |  |
| `tax_name` | `varchar(191)` | yes | `NULL` |  |
| `jurisdiction_level` | `longtext` | yes | `NULL` |  |
| `default_rate` | `decimal(5,2)` | yes | `NULL` |  |
| `rate_range` | `longtext` | yes | `NULL` |  |
| `components` | `longtext` | yes | `NULL` |  |
| `registration_number_label` | `varchar(191)` | yes | `NULL` |  |
| `calculation_notes` | `text` | yes | `NULL` |  |
| `rate_source` | `varchar(191)` | yes | `NULL` |  |
| `tax_status` | `varchar(50)` | yes | `NULL` |  |
| `tax_verified_at` | `date` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)

## credit_note_details

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `credit_note_id` | `bigint(20) unsigned` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `item_condition` | `enum('1','2')` | no | `'1'` | 1:Good, 2:Bad |
| `item_uom_id` | `bigint(20) unsigned` | no | — |  |
| `item_qty` | `decimal(18,2)` | no | `0.00` |  |
| `item_price` | `decimal(18,3)` | no | `0.000` |  |
| `item_gross` | `decimal(18,3)` | no | `0.000` | item_qty * item_price |
| `item_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `item_net` | `decimal(18,3)` | no | `0.000` | item_gross - item_discount_amount |
| `item_vat` | `decimal(18,3)` | no | `0.000` |  |
| `item_excise` | `decimal(18,3)` | no | `0.000` |  |
| `item_grand_total` | `decimal(18,3)` | no | `0.000` | item_net + item_vat + item_excise |
| `batch_number` | `varchar(191)` | yes | `NULL` |  |
| `reason` | `varchar(191)` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `credit_note_details_credit_note_id_item_id_index` (credit_note_id, item_id)
- index `credit_note_details_item_id_foreign` (item_id)
- index `credit_note_details_item_uom_id_index` (item_uom_id)
- unique `credit_note_details_uuid_unique` (uuid)
- primary `primary` (id)

**Foreign keys**

- (credit_note_id) → `credit_notes`(id) on update restrict, on delete restrict
- (item_id) → `items`(id) on update restrict, on delete restrict

## credit_notes

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `invoice_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `customer_id` | `bigint(20) unsigned` | no | — |  |
| `salesman_id` | `bigint(20) unsigned` | no | — |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `payment_term_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `credit_note_number` | `varchar(191)` | no | — |  |
| `credit_note_date` | `date` | no | — |  |
| `reason` | `varchar(191)` | yes | `NULL` |  |
| `total_qty` | `decimal(18,2)` | no | `0.00` |  |
| `total_gross` | `decimal(18,3)` | no | `0.000` |  |
| `total_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `total_net` | `decimal(18,3)` | no | `0.000` | total_gross - total_discount_amount |
| `total_vat` | `decimal(18,3)` | no | `0.000` |  |
| `total_excise` | `decimal(18,3)` | no | `0.000` |  |
| `grand_total` | `decimal(18,3)` | no | `0.000` | total_net + total_vat + total_excise |
| `pending_credit` | `decimal(18,3)` | no | `0.000` |  |
| `credit_note_comment` | `text` | yes | `NULL` |  |
| `source` | `int(11)` | no | — | 1:Mobile, 2:Backend, 3:Frontend |
| `status` | `tinyint(1)` | no | `1` |  |
| `approval_status` | `enum('Created','Updated','Deleted')` | no | `'Created'` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `credit_notes_customer_id_foreign` (customer_id)
- index `credit_notes_invoice_id_foreign` (invoice_id)
- index `credit_notes_organisation_id_approval_status_index` (organisation_id, approval_status)
- index `credit_notes_organisation_id_credit_note_date_index` (organisation_id, credit_note_date)
- unique `credit_notes_organisation_id_credit_note_number_unique` (organisation_id, credit_note_number)
- index `credit_notes_organisation_id_status_index` (organisation_id, status)
- unique `credit_notes_organisation_id_uuid_unique` (organisation_id, uuid)
- index `credit_notes_payment_term_id_foreign` (payment_term_id)
- index `credit_notes_route_id_foreign` (route_id)
- index `credit_notes_salesman_id_foreign` (salesman_id)
- primary `primary` (id)

**Foreign keys**

- (customer_id) → `customers`(id) on update restrict, on delete restrict
- (invoice_id) → `invoices`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (payment_term_id) → `payment_terms`(id) on update restrict, on delete restrict
- (route_id) → `routes`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict

## currencies

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `currency_master_id` | `bigint(20) unsigned` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `symbol` | `char(10)` | no | — |  |
| `code` | `varchar(191)` | no | — |  |
| `name_plural` | `varchar(191)` | no | — |  |
| `symbol_native` | `char(10)` | no | — |  |
| `decimal_digits` | `bigint(20)` | no | — |  |
| `rounding` | `bigint(20)` | no | — |  |
| `default_currency` | `tinyint(1)` | no | `0` |  |
| `format` | `enum('1,234,567.89','1.234.567.89','1 234 567.89')` | no | — |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `currencies_currency_master_id_foreign` (currency_master_id)
- index `currencies_organisation_id_foreign` (organisation_id)
- primary `primary` (id)

**Foreign keys**

- (currency_master_id) → `currency_masters`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## currency_masters

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `code` | `varchar(191)` | no | — |  |
| `name_plural` | `varchar(191)` | no | — |  |
| `symbol` | `varchar(191)` | no | — |  |
| `symbol_native` | `varchar(191)` | no | — |  |
| `decimal_digits` | `bigint(20)` | no | — |  |
| `rounding` | `bigint(20)` | no | — |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)

## customer_categories

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `customer_category_code` | `varchar(255)` | no | — | like CC01, CC02 etc. |
| `parent_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `node_level` | `bigint(20)` | no | `0` |  |
| `customer_category_name` | `varchar(255)` | no | — | like agent, depo etc. |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `customer_categories_organisation_id_customer_category_code_index` (organisation_id, customer_category_code)
- index `customer_categories_organisation_id_status_index` (organisation_id, status)
- index `customer_categories_parent_id_foreign` (parent_id)
- unique `customer_categories_uuid_unique` (uuid)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete cascade
- (parent_id) → `customer_categories`(id) on update restrict, on delete cascade

## customer_groups

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `group_code` | `varchar(191)` | no | — |  |
| `group_name` | `varchar(191)` | no | — |  |
| `type` | `varchar(20)` | yes | `NULL` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `customer_groups_organisation_id_group_code_index` (organisation_id, group_code)
- index `customer_groups_organisation_id_status_index` (organisation_id, status)
- unique `customer_groups_organisation_id_uuid_unique` (organisation_id, uuid)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## customer_types

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `customer_type_code` | `varchar(191)` | no | — |  |
| `customer_type_name` | `varchar(191)` | no | — | like Head Office, Branch, Normal |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `customer_types_customer_type_code_index` (customer_type_code)
- index `customer_types_status_index` (status)
- unique `customer_types_uuid_unique` (uuid)
- primary `primary` (id)

## customers

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `user_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `customer_code` | `varchar(25)` | no | — |  |
| `shop_name` | `varchar(191)` | no | — |  |
| `firstname` | `varchar(191)` | no | — |  |
| `lastname` | `varchar(191)` | yes | `NULL` |  |
| `email` | `varchar(191)` | yes | `NULL` |  |
| `phone` | `varchar(191)` | yes | `NULL` |  |
| `address` | `varchar(191)` | no | — |  |
| `city` | `varchar(191)` | yes | `NULL` |  |
| `state` | `varchar(191)` | yes | `NULL` |  |
| `zipcode` | `varchar(191)` | yes | `NULL` |  |
| `latitude` | `decimal(10,7)` | yes | `NULL` |  |
| `longitude` | `decimal(10,7)` | yes | `NULL` |  |
| `balance` | `decimal(15,2)` | no | `0.00` |  |
| `credit_limit` | `decimal(15,2)` | no | `0.00` |  |
| `credit_days` | `int(11)` | no | `0` |  |
| `profile_image` | `varchar(191)` | yes | `NULL` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `salesman_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `customer_type_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `customer_category_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `customer_group_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `channel_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `payment_term_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |
| `customer_office_address` | `varchar(255)` | yes | `NULL` |  |
| `customer_office_city` | `varchar(255)` | yes | `NULL` |  |
| `customer_office_state` | `varchar(255)` | yes | `NULL` |  |
| `customer_office_zipcode` | `varchar(255)` | yes | `NULL` |  |
| `customer_office_phone` | `varchar(255)` | yes | `NULL` |  |
| `customer_office_lat` | `varchar(255)` | yes | `NULL` |  |
| `customer_office_lang` | `varchar(255)` | yes | `NULL` |  |
| `customer_home_address` | `varchar(255)` | yes | `NULL` |  |
| `customer_home_lat` | `varchar(255)` | yes | `NULL` |  |
| `customer_home_lang` | `varchar(255)` | yes | `NULL` |  |
| `sales_organisation_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `country_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `region_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `ship_to_party_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `sold_to_party_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `payer_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `bill_to_party_id` | `bigint(20) unsigned` | yes | `NULL` |  |

**Indexes**

- index `customers_bill_to_party_id_foreign` (bill_to_party_id)
- index `customers_channel_id_foreign` (channel_id)
- index `customers_country_id_foreign` (country_id)
- index `customers_customer_category_id_foreign` (customer_category_id)
- index `customers_customer_group_id_foreign` (customer_group_id)
- index `customers_customer_type_id_foreign` (customer_type_id)
- index `customers_firstname_index` (firstname)
- index `customers_organisation_id_channel_id_index` (organisation_id, channel_id)
- index `customers_organisation_id_customer_category_id_index` (organisation_id, customer_category_id)
- index `customers_organisation_id_customer_code_index` (organisation_id, customer_code)
- index `customers_organisation_id_customer_group_id_index` (organisation_id, customer_group_id)
- index `customers_organisation_id_customer_type_id_index` (organisation_id, customer_type_id)
- index `customers_organisation_id_payment_term_id_index` (organisation_id, payment_term_id)
- index `customers_organisation_id_route_id_index` (organisation_id, route_id)
- index `customers_organisation_id_salesman_id_index` (organisation_id, salesman_id)
- index `customers_organisation_id_status_index` (organisation_id, status)
- unique `customers_organisation_id_uuid_unique` (organisation_id, uuid)
- index `customers_payer_id_foreign` (payer_id)
- index `customers_payment_term_id_foreign` (payment_term_id)
- index `customers_phone_index` (phone)
- index `customers_region_id_foreign` (region_id)
- index `customers_route_id_foreign` (route_id)
- index `customers_salesman_id_foreign` (salesman_id)
- index `customers_ship_to_party_id_foreign` (ship_to_party_id)
- index `customers_shop_name_index` (shop_name)
- index `customers_sold_to_party_id_foreign` (sold_to_party_id)
- unique `customers_user_id_unique` (user_id)
- primary `primary` (id)

**Foreign keys**

- (bill_to_party_id) → `customers`(id) on update restrict, on delete restrict
- (channel_id) → `channels`(id) on update restrict, on delete restrict
- (country_id) → `countries`(id) on update restrict, on delete restrict
- (customer_category_id) → `customer_categories`(id) on update restrict, on delete restrict
- (customer_group_id) → `customer_groups`(id) on update restrict, on delete restrict
- (customer_type_id) → `customer_types`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (payer_id) → `customers`(id) on update restrict, on delete restrict
- (payment_term_id) → `payment_terms`(id) on update restrict, on delete restrict
- (region_id) → `regions`(id) on update restrict, on delete restrict
- (route_id) → `routes`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict
- (ship_to_party_id) → `customers`(id) on update restrict, on delete restrict
- (sold_to_party_id) → `customers`(id) on update restrict, on delete restrict
- (user_id) → `users`(id) on update restrict, on delete set null

## debit_note_details

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `debit_note_id` | `bigint(20) unsigned` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `item_condition` | `enum('1','2')` | no | `'1'` | 1:Good, 2:Bad |
| `item_uom_id` | `bigint(20) unsigned` | no | — |  |
| `discount_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `is_free` | `tinyint(1)` | no | `0` |  |
| `is_item_poi` | `tinyint(1)` | no | `0` |  |
| `promotion_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `item_qty` | `decimal(18,2)` | no | `0.00` |  |
| `item_price` | `decimal(18,3)` | no | `0.000` |  |
| `item_gross` | `decimal(18,3)` | no | `0.000` | item_qty * item_price |
| `item_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `item_net` | `decimal(18,3)` | no | `0.000` | item_gross - item_discount_amount |
| `item_vat` | `decimal(18,3)` | no | `0.000` |  |
| `item_excise` | `decimal(18,3)` | no | `0.000` |  |
| `item_grand_total` | `decimal(18,3)` | no | `0.000` | item_net + item_vat + item_excise |
| `batch_number` | `varchar(191)` | yes | `NULL` |  |
| `reason` | `varchar(191)` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `debit_note_details_debit_note_id_item_id_index` (debit_note_id, item_id)
- index `debit_note_details_item_id_foreign` (item_id)
- index `debit_note_details_item_uom_id_index` (item_uom_id)
- unique `debit_note_details_uuid_unique` (uuid)
- primary `primary` (id)

**Foreign keys**

- (debit_note_id) → `debit_notes`(id) on update restrict, on delete restrict
- (item_id) → `items`(id) on update restrict, on delete restrict

## debit_notes

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `invoice_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `customer_id` | `bigint(20) unsigned` | no | — |  |
| `salesman_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `trip_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `lob_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `reason` | `varchar(191)` | yes | `NULL` |  |
| `debit_note_number` | `varchar(191)` | no | — |  |
| `debit_note_date` | `date` | no | — |  |
| `payment_term_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `total_qty` | `decimal(18,2)` | no | `0.00` |  |
| `total_gross` | `decimal(18,3)` | no | `0.000` |  |
| `total_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `total_net` | `decimal(18,3)` | no | `0.000` | total_gross - total_discount_amount |
| `total_vat` | `decimal(18,3)` | no | `0.000` |  |
| `total_excise` | `decimal(18,3)` | no | `0.000` |  |
| `grand_total` | `decimal(18,3)` | no | `0.000` | total_net + total_vat + total_excise |
| `pending_credit` | `decimal(18,3)` | no | `0.000` |  |
| `pdc_amount` | `decimal(18,3)` | no | `0.000` |  |
| `debit_note_comment` | `text` | yes | `NULL` |  |
| `source` | `int(11)` | no | — | 1:Mobile, 2:Backend, 3:Frontend |
| `status` | `tinyint(1)` | no | `1` |  |
| `is_debit_note` | `tinyint(1)` | no | `1` |  |
| `supplier_recipt_date` | `date` | yes | `NULL` |  |
| `supplier_recipt_number` | `varchar(191)` | yes | `NULL` |  |
| `debit_note_type` | `enum('debit_note','listing_fees','shelf_rent','rebate_discount')` | no | `'debit_note'` |  |
| `approval_status` | `enum('Created','Updated','Deleted')` | no | `'Created'` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `debit_notes_customer_id_foreign` (customer_id)
- index `debit_notes_invoice_id_foreign` (invoice_id)
- index `debit_notes_organisation_id_approval_status_index` (organisation_id, approval_status)
- index `debit_notes_organisation_id_debit_note_date_index` (organisation_id, debit_note_date)
- unique `debit_notes_organisation_id_debit_note_number_unique` (organisation_id, debit_note_number)
- index `debit_notes_organisation_id_status_index` (organisation_id, status)
- unique `debit_notes_organisation_id_uuid_unique` (organisation_id, uuid)
- index `debit_notes_payment_term_id_foreign` (payment_term_id)
- index `debit_notes_route_id_foreign` (route_id)
- index `debit_notes_salesman_id_foreign` (salesman_id)
- primary `primary` (id)

**Foreign keys**

- (customer_id) → `customers`(id) on update restrict, on delete restrict
- (invoice_id) → `invoices`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (payment_term_id) → `payment_terms`(id) on update restrict, on delete restrict
- (route_id) → `routes`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict

## deliveries

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `order_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `customer_id` | `bigint(20) unsigned` | no | — |  |
| `salesman_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `reason_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `storage_location_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `warehouse_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `lob_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `delivery_type` | `bigint(20) unsigned` | no | — | from order type table |
| `delivery_type_source` | `enum('1','2')` | no | — |  |
| `delivery_number` | `varchar(191)` | no | — |  |
| `invoice_number` | `varchar(191)` | yes | `NULL` |  |
| `invoice_route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `delivery_date` | `date` | no | — |  |
| `change_date` | `date` | yes | `NULL` |  |
| `delivery_time` | `time` | no | — |  |
| `delivery_due_date` | `date` | no | — |  |
| `delivery_weight` | `varchar(191)` | yes | `NULL` |  |
| `payment_term_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `total_qty` | `decimal(18,2)` | no | `0.00` |  |
| `total_cancel_qty` | `decimal(8,2)` | no | `0.00` |  |
| `total_gross` | `decimal(18,3)` | no | `0.000` |  |
| `total_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `total_net` | `decimal(18,3)` | no | `0.000` | total_gross - total_discount_amount |
| `total_vat` | `decimal(18,3)` | no | `0.000` |  |
| `total_excise` | `decimal(18,3)` | no | `0.000` |  |
| `grand_total` | `decimal(18,3)` | no | `0.000` | total_net + total_vat + total_excise |
| `current_stage` | `enum('Pending','Approved','Rejected','In-Process','Completed')` | no | `'Pending'` |  |
| `current_stage_comment` | `text` | yes | `NULL` |  |
| `approval_status` | `enum('Deleted','Created','Updated','In-Process','Partial-Invoiced','Completed','Cancel','Shipment','Truck Allocated','Picked')` | no | `'Created'` |  |
| `source` | `int(11)` | no | — | 1:Mobile, 2:Backend, 3:Frontend |
| `status` | `tinyint(1)` | no | `1` |  |
| `is_approved` | `tinyint(1)` | no | `0` |  |
| `is_truck_allocated` | `tinyint(1)` | no | `0` |  |
| `sync_status` | `text` | yes | `NULL` |  |
| `picking_status` | `enum('partial','full')` | yes | `NULL` |  |
| `transportation_status` | `enum('No','Delegated')` | yes | `NULL` |  |
| `shipment_status` | `enum('partial','full')` | yes | `NULL` |  |
| `invoice_status` | `enum('partial','full')` | yes | `NULL` |  |
| `is_user_updated` | `tinyint(1)` | no | `0` |  |
| `user_updated` | `bigint(20)` | yes | `NULL` |  |
| `module_updated` | `varchar(191)` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `deliveries_customer_id_foreign` (customer_id)
- index `deliveries_order_id_foreign` (order_id)
- index `deliveries_organisation_id_current_stage_index` (organisation_id, current_stage)
- index `deliveries_organisation_id_delivery_date_index` (organisation_id, delivery_date)
- unique `deliveries_organisation_id_delivery_number_unique` (organisation_id, delivery_number)
- index `deliveries_organisation_id_status_index` (organisation_id, status)
- unique `deliveries_organisation_id_uuid_unique` (organisation_id, uuid)
- index `deliveries_payment_term_id_foreign` (payment_term_id)
- index `deliveries_reason_id_foreign` (reason_id)
- index `deliveries_route_id_foreign` (route_id)
- index `deliveries_salesman_id_foreign` (salesman_id)
- index `deliveries_warehouse_id_foreign` (warehouse_id)
- primary `primary` (id)

**Foreign keys**

- (customer_id) → `customers`(id) on update restrict, on delete restrict
- (order_id) → `orders`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (payment_term_id) → `payment_terms`(id) on update restrict, on delete restrict
- (reason_id) → `reason_types`(id) on update restrict, on delete restrict
- (route_id) → `routes`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict
- (warehouse_id) → `warehouses`(id) on update restrict, on delete restrict

## delivery_details

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `delivery_id` | `bigint(20) unsigned` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `item_uom_id` | `bigint(20) unsigned` | no | — |  |
| `original_item_uom_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `discount_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `is_free` | `tinyint(1)` | no | `0` |  |
| `is_item_poi` | `tinyint(1)` | no | `0` |  |
| `promotion_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `reason_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `item_qty` | `decimal(18,2)` | no | `0.00` |  |
| `original_item_id` | `decimal(8,2)` | no | `0.00` |  |
| `item_price` | `decimal(18,3)` | no | `0.000` |  |
| `item_gross` | `decimal(18,3)` | no | `0.000` | item_qty * item_price |
| `item_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `item_net` | `decimal(18,3)` | no | `0.000` | item_gross - item_discount_amount |
| `item_vat` | `decimal(18,3)` | no | `0.000` |  |
| `item_excise` | `decimal(18,3)` | no | `0.000` |  |
| `item_grand_total` | `decimal(18,3)` | no | `0.000` | item_net + item_vat + item_excise |
| `batch_number` | `varchar(191)` | yes | `NULL` |  |
| `invoiced_qty` | `decimal(18,2)` | no | `0.00` |  |
| `open_qty` | `decimal(18,2)` | no | `0.00` |  |
| `original_item_qty` | `decimal(8,2)` | no | `0.00` |  |
| `cancel_qty` | `decimal(8,2)` | no | `0.00` |  |
| `delivery_status` | `enum('Pending','Invoiced','Partial-Invoiced','Cancelled')` | no | `'Pending'` |  |
| `picking_status` | `enum('partial','full')` | yes | `NULL` |  |
| `transportation_status` | `enum('No','Delegated')` | yes | `NULL` |  |
| `shipment_status` | `enum('partial','full')` | yes | `NULL` |  |
| `invoice_status` | `enum('partial','full')` | yes | `NULL` |  |
| `is_deleted` | `tinyint(1)` | no | `0` |  |
| `is_picking` | `tinyint(1)` | no | `0` |  |
| `delivery_note_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `delivery_details_delivery_id_item_id_index` (delivery_id, item_id)
- index `delivery_details_item_id_foreign` (item_id)
- index `delivery_details_item_uom_id_index` (item_uom_id)
- index `delivery_details_reason_id_foreign` (reason_id)
- unique `delivery_details_uuid_unique` (uuid)
- primary `primary` (id)

**Foreign keys**

- (delivery_id) → `deliveries`(id) on update restrict, on delete restrict
- (item_id) → `items`(id) on update restrict, on delete restrict
- (reason_id) → `reason_types`(id) on update restrict, on delete restrict

## depots

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `user_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `region_id` | `bigint(20) unsigned` | no | — |  |
| `area_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `depot_code` | `varchar(20)` | no | — |  |
| `depot_name` | `varchar(100)` | no | — |  |
| `depot_manager` | `varchar(191)` | no | — |  |
| `depot_manager_contact` | `varchar(50)` | yes | `NULL` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `depots_area_id_foreign` (area_id)
- index `depots_organisation_id_foreign` (organisation_id)
- index `depots_region_id_foreign` (region_id)
- index `depots_user_id_foreign` (user_id)
- primary `primary` (id)

**Foreign keys**

- (area_id) → `areas`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (region_id) → `regions`(id) on update restrict, on delete restrict
- (user_id) → `users`(id) on update restrict, on delete restrict

## divisions

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `code` | `varchar(191)` | yes | `NULL` |  |
| `name` | `varchar(191)` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `divisions_organisation_id_status_index` (organisation_id, status)
- unique `divisions_organisation_id_uuid_unique` (organisation_id, uuid)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## document_line_taxes

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `taxable_type` | `varchar(100)` | no | — |  |
| `taxable_id` | `bigint(20) unsigned` | no | — |  |
| `tax_code` | `varchar(50)` | no | — |  |
| `tax_name` | `varchar(191)` | no | — |  |
| `rate` | `decimal(7,3)` | yes | `NULL` | percent; null when unknown (backfilled rows) |
| `taxable_amount` | `decimal(18,3)` | no | `0.000` |  |
| `tax_amount` | `decimal(18,3)` | no | `0.000` |  |
| `source` | `varchar(20)` | no | — | tax_table, item or legacy |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `document_line_taxes_organisation_id_tax_code_index` (organisation_id, tax_code)
- unique `document_line_taxes_taxable_type_taxable_id_tax_code_unique` (taxable_type, taxable_id, tax_code)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## driver_and_van_swapings

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `order_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `new_salesman_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `old_salesman_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `old_van_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `new_van_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `login_user_id` | `bigint(20) unsigned` | no | — |  |
| `reason_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `date` | `date` | no | — |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `driver_and_van_swapings_login_user_id_foreign` (login_user_id)
- index `driver_and_van_swapings_new_salesman_id_foreign` (new_salesman_id)
- index `driver_and_van_swapings_new_van_id_foreign` (new_van_id)
- index `driver_and_van_swapings_old_salesman_id_foreign` (old_salesman_id)
- index `driver_and_van_swapings_old_van_id_foreign` (old_van_id)
- index `driver_and_van_swapings_organisation_id_foreign` (organisation_id)
- index `driver_and_van_swapings_reason_id_foreign` (reason_id)
- primary `primary` (id)

**Foreign keys**

- (login_user_id) → `users`(id) on update restrict, on delete restrict
- (new_salesman_id) → `users`(id) on update restrict, on delete restrict
- (new_van_id) → `vans`(id) on update restrict, on delete restrict
- (old_salesman_id) → `users`(id) on update restrict, on delete restrict
- (old_van_id) → `vans`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (reason_id) → `reason_types`(id) on update restrict, on delete restrict

## failed_jobs

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `varchar(255)` | no | — |  |
| `connection` | `varchar(255)` | no | — |  |
| `queue` | `varchar(255)` | no | — |  |
| `payload` | `longtext` | no | — |  |
| `exception` | `longtext` | no | — |  |
| `failed_at` | `timestamp` | no | `current_timestamp()` |  |

**Indexes**

- index `failed_jobs_connection_queue_failed_at_index` (connection, queue, failed_at)
- unique `failed_jobs_uuid_unique` (uuid)
- primary `primary` (id)

## good_receipt_note_details

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `good_receipt_note_id` | `bigint(20) unsigned` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `item_uom_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `qty` | `decimal(18,2)` | no | `0.00` |  |
| `reason_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `return_reason_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `good_receipt_note_details_good_receipt_note_id_item_id_index` (good_receipt_note_id, item_id)
- index `good_receipt_note_details_item_id_foreign` (item_id)
- unique `good_receipt_note_details_uuid_unique` (uuid)
- primary `primary` (id)

**Foreign keys**

- (good_receipt_note_id) → `good_receipt_notes`(id) on update restrict, on delete restrict
- (item_id) → `items`(id) on update restrict, on delete restrict

## good_receipt_notes

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `source_warehouse_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `destination_warehouse_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `grn_number` | `varchar(191)` | no | — |  |
| `grn_date` | `date` | no | — |  |
| `grn_remark` | `text` | yes | `NULL` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `good_receipt_notes_destination_warehouse_id_foreign` (destination_warehouse_id)
- index `good_receipt_notes_organisation_id_grn_date_index` (organisation_id, grn_date)
- unique `good_receipt_notes_organisation_id_grn_number_unique` (organisation_id, grn_number)
- index `good_receipt_notes_organisation_id_status_index` (organisation_id, status)
- unique `good_receipt_notes_organisation_id_uuid_unique` (organisation_id, uuid)
- index `good_receipt_notes_source_warehouse_id_foreign` (source_warehouse_id)
- primary `primary` (id)

**Foreign keys**

- (destination_warehouse_id) → `warehouses`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (source_warehouse_id) → `warehouses`(id) on update restrict, on delete restrict

## invoice_details

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `invoice_id` | `bigint(20) unsigned` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `item_uom_id` | `bigint(20) unsigned` | no | — |  |
| `van_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `discount_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `is_free` | `tinyint(1)` | no | `0` |  |
| `is_item_poi` | `tinyint(1)` | no | `0` |  |
| `promotion_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `item_qty` | `decimal(18,2)` | no | `0.00` |  |
| `lower_unit_qty` | `decimal(18,2)` | no | `0.00` |  |
| `item_price` | `decimal(18,3)` | no | `0.000` |  |
| `item_gross` | `decimal(18,3)` | no | `0.000` | item_qty * item_price |
| `item_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `item_net` | `decimal(18,3)` | no | `0.000` | item_gross - item_discount_amount |
| `item_vat` | `decimal(18,3)` | no | `0.000` |  |
| `item_excise` | `decimal(18,3)` | no | `0.000` |  |
| `item_grand_total` | `decimal(18,3)` | no | `0.000` | item_net + item_vat + item_excise |
| `base_price` | `decimal(18,3)` | no | `0.000` |  |
| `batch_number` | `varchar(191)` | yes | `NULL` |  |
| `original_item_qty` | `decimal(8,2)` | no | `0.00` |  |
| `erp_post_id` | `int(11)` | yes | `NULL` |  |
| `erp_response_error` | `longtext` | yes | `NULL` |  |
| `is_deleted` | `tinyint(1)` | no | `0` |  |
| `delv_id` | `bigint(20)` | yes | `NULL` |  |
| `deleted_import_data` | `tinyint(4)` | no | `0` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |
| `import_date` | `date` | yes | `NULL` |  |

**Indexes**

- index `invoice_details_invoice_id_item_id_index` (invoice_id, item_id)
- index `invoice_details_item_id_foreign` (item_id)
- index `invoice_details_item_uom_id_index` (item_uom_id)
- unique `invoice_details_uuid_unique` (uuid)
- index `invoice_details_van_id_foreign` (van_id)
- primary `primary` (id)

**Foreign keys**

- (invoice_id) → `invoices`(id) on update restrict, on delete restrict
- (item_id) → `items`(id) on update restrict, on delete restrict
- (van_id) → `vans`(id) on update restrict, on delete restrict

## invoices

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `customer_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `depot_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `order_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `order_type_id` | `bigint(20) unsigned` | no | — |  |
| `delivery_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `salesman_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `reason_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `trip_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `van_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `storage_location_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `warehouse_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `lob_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `invoice_type` | `enum('1','2')` | no | `'1'` | 1.Invoicing, 2.OTC-Order to Cash |
| `invoice_number` | `varchar(191)` | no | — |  |
| `invoice_date` | `date` | no | — |  |
| `invoice_due_date` | `date` | no | — |  |
| `payment_term_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `total_qty` | `decimal(18,2)` | no | `0.00` |  |
| `total_cancel_qty` | `decimal(8,2)` | no | `0.00` |  |
| `total_gross` | `decimal(18,3)` | no | `0.000` |  |
| `total_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `total_net` | `decimal(18,3)` | no | `0.000` | total_gross - total_discount_amount |
| `total_vat` | `decimal(18,3)` | no | `0.000` |  |
| `total_excise` | `decimal(18,3)` | no | `0.000` |  |
| `grand_total` | `decimal(18,3)` | no | `0.000` | total_net + total_vat + total_excise |
| `rounding_off_amount` | `decimal(18,3)` | no | `0.000` |  |
| `pending_credit` | `decimal(18,3)` | no | `0.000` |  |
| `pdc_amount` | `decimal(18,3)` | no | `0.000` |  |
| `current_stage` | `enum('Pending','Approved','Rejected','In-Process','Completed')` | no | `'Pending'` |  |
| `current_stage_comment` | `text` | yes | `NULL` |  |
| `approval_status` | `enum('Deleted','Created','Updated','In-Process','Completed')` | no | `'Created'` |  |
| `payment_received` | `tinyint(1)` | no | `0` |  |
| `is_exchange` | `tinyint(1)` | no | `0` |  |
| `exchange_number` | `varchar(50)` | yes | `NULL` |  |
| `is_premium_invoice` | `tinyint(1)` | yes | `NULL` |  |
| `customer_lpo` | `varchar(100)` | yes | `NULL` |  |
| `source` | `int(11)` | no | — | 1:Mobile, 2:Backend, 3:Frontend |
| `status` | `tinyint(1)` | no | `1` |  |
| `is_submitted` | `tinyint(1)` | no | `0` |  |
| `oddo_post_id` | `bigint(20)` | yes | `NULL` |  |
| `odoo_failed_response` | `longtext` | yes | `NULL` |  |
| `mobile_created_at` | `timestamp` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `invoices_customer_id_foreign` (customer_id)
- index `invoices_delivery_id_foreign` (delivery_id)
- index `invoices_depot_id_foreign` (depot_id)
- index `invoices_order_id_foreign` (order_id)
- index `invoices_organisation_id_current_stage_index` (organisation_id, current_stage)
- index `invoices_organisation_id_invoice_date_index` (organisation_id, invoice_date)
- unique `invoices_organisation_id_invoice_number_unique` (organisation_id, invoice_number)
- index `invoices_organisation_id_status_index` (organisation_id, status)
- unique `invoices_organisation_id_uuid_unique` (organisation_id, uuid)
- index `invoices_payment_term_id_foreign` (payment_term_id)
- index `invoices_reason_id_foreign` (reason_id)
- index `invoices_route_id_foreign` (route_id)
- index `invoices_salesman_id_foreign` (salesman_id)
- index `invoices_van_id_foreign` (van_id)
- index `invoices_warehouse_id_foreign` (warehouse_id)
- primary `primary` (id)

**Foreign keys**

- (customer_id) → `customers`(id) on update restrict, on delete restrict
- (delivery_id) → `deliveries`(id) on update restrict, on delete restrict
- (depot_id) → `depots`(id) on update restrict, on delete restrict
- (order_id) → `orders`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (payment_term_id) → `payment_terms`(id) on update restrict, on delete restrict
- (reason_id) → `reason_types`(id) on update restrict, on delete restrict
- (route_id) → `routes`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict
- (van_id) → `vans`(id) on update restrict, on delete restrict
- (warehouse_id) → `warehouses`(id) on update restrict, on delete restrict

## item_categories

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `category_name` | `varchar(191)` | no | — |  |
| `description` | `varchar(191)` | yes | `NULL` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `item_categories_organisation_id_foreign` (organisation_id)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## item_groups

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `code` | `varchar(191)` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `item_groups_organisation_id_foreign` (organisation_id)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## item_main_prices

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `item_upc` | `varchar(20)` | no | — |  |
| `item_uom_id` | `bigint(20) unsigned` | no | — |  |
| `item_shipping_uom` | `tinyint(1)` | no | `0` |  |
| `is_secondary` | `tinyint(1)` | no | `0` |  |
| `stock_keeping_unit` | `tinyint(1)` | no | `0` |  |
| `item_price` | `decimal(18,2)` | no | `0.00` | default price |
| `purchase_order_price` | `decimal(18,2)` | no | `0.00` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `item_main_prices_item_id_foreign` (item_id)
- primary `primary` (id)

**Foreign keys**

- (item_id) → `items`(id) on update restrict, on delete restrict

## item_uoms

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `code` | `varchar(191)` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `item_uoms_organisation_id_foreign` (organisation_id)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## items

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `item_major_category_id` | `bigint(20) unsigned` | no | — |  |
| `item_group_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `brand_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `channel_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `is_product_catalog` | `tinyint(1)` | no | `0` |  |
| `is_promotional` | `tinyint(1)` | no | `0` |  |
| `item_code` | `varchar(191)` | no | — |  |
| `item_name` | `varchar(191)` | no | — |  |
| `item_description` | `varchar(191)` | yes | `NULL` |  |
| `item_barcode` | `varchar(191)` | yes | `NULL` |  |
| `item_weight` | `decimal(18,2)` | no | `0.00` |  |
| `item_shelf_life` | `varchar(191)` | yes | `NULL` |  |
| `volume` | `decimal(18,2)` | no | `0.00` |  |
| `lower_unit_item_upc` | `int(11)` | no | — |  |
| `lower_unit_uom_id` | `bigint(20) unsigned` | no | — | which UOM is lower unit. |
| `lower_unit_item_price` | `decimal(18,2)` | no | — |  |
| `lower_unit_purchase_order_price` | `decimal(18,2)` | no | — |  |
| `item_shipping_uom` | `tinyint(1)` | no | `0` |  |
| `is_tax_apply` | `tinyint(1)` | no | `1` |  |
| `item_vat_percentage` | `decimal(5,2)` | no | `0.00` |  |
| `is_item_excise` | `tinyint(1)` | no | `0` |  |
| `item_excise` | `decimal(5,2)` | no | `0.00` |  |
| `item_excise_uom_id` | `bigint(20) unsigned` | no | `0` |  |
| `new_lunch` | `tinyint(1)` | no | `0` |  |
| `start_date` | `date` | no | — |  |
| `end_date` | `date` | no | — |  |
| `current_stage` | `enum('Pending','Approved','Rejected')` | no | `'Pending'` |  |
| `current_stage_comment` | `text` | yes | `NULL` |  |
| `item_image` | `varchar(300)` | yes | `NULL` |  |
| `stock_keeping_unit` | `tinyint(1)` | no | `0` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `items_organisation_id_foreign` (organisation_id)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## job_batches

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `varchar(255)` | no | — |  |
| `name` | `varchar(255)` | no | — |  |
| `total_jobs` | `int(11)` | no | — |  |
| `pending_jobs` | `int(11)` | no | — |  |
| `failed_jobs` | `int(11)` | no | — |  |
| `failed_job_ids` | `longtext` | no | — |  |
| `options` | `mediumtext` | yes | `NULL` |  |
| `cancelled_at` | `int(11)` | yes | `NULL` |  |
| `created_at` | `int(11)` | no | — |  |
| `finished_at` | `int(11)` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)

## jobs

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `queue` | `varchar(255)` | no | — |  |
| `payload` | `longtext` | no | — |  |
| `attempts` | `smallint(5) unsigned` | no | — |  |
| `reserved_at` | `int(10) unsigned` | yes | `NULL` |  |
| `available_at` | `int(10) unsigned` | no | — |  |
| `created_at` | `int(10) unsigned` | no | — |  |

**Indexes**

- index `jobs_queue_index` (queue)
- primary `primary` (id)

## journey_plan_customers

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `journey_plan_id` | `bigint(20) unsigned` | no | — |  |
| `week_number` | `enum('week1','week2','week3','week4','week5')` | yes | `NULL` |  |
| `day_of_week` | `enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday')` | no | — |  |
| `sequence` | `int(10) unsigned` | no | `0` |  |
| `customer_id` | `bigint(20) unsigned` | no | — |  |
| `msl_perform` | `tinyint(1)` | no | `0` |  |
| `start_time` | `time` | yes | `NULL` |  |
| `end_time` | `time` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `journey_plan_customers_customer_id_foreign` (customer_id)
- index `journey_plan_customers_journey_plan_id_day_of_week_index` (journey_plan_id, day_of_week)
- unique `journey_plan_customers_uuid_unique` (uuid)
- index `jpc_plan_week_day_idx` (journey_plan_id, week_number, day_of_week)
- primary `primary` (id)

**Foreign keys**

- (customer_id) → `customers`(id) on update restrict, on delete restrict
- (journey_plan_id) → `journey_plans`(id) on update restrict, on delete restrict

## journey_plans

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `salesman_id` | `bigint(20) unsigned` | no | — |  |
| `journey_name` | `varchar(191)` | no | — |  |
| `description` | `text` | yes | `NULL` |  |
| `start_date` | `date` | no | — |  |
| `no_end` | `tinyint(1)` | no | `0` |  |
| `end_date` | `date` | yes | `NULL` |  |
| `start_time` | `time` | yes | `NULL` |  |
| `end_time` | `time` | yes | `NULL` |  |
| `journey_plan_base` | `enum('day_wise','week_wise')` | no | `'day_wise'` |  |
| `selected_weeks` | `longtext` | yes | `NULL` |  |
| `first_day_of_week` | `enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday')` | no | `'monday'` |  |
| `enforce_flag` | `tinyint(1)` | no | `0` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `journey_plans_organisation_id_status_salesman_id_index` (organisation_id, status, salesman_id)
- unique `journey_plans_organisation_id_uuid_unique` (organisation_id, uuid)
- index `journey_plans_salesman_id_foreign` (salesman_id)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict

## merchandiser_replacements

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `old_salesman_id` | `bigint(20) unsigned` | no | — |  |
| `new_salesman_id` | `bigint(20) unsigned` | no | — |  |
| `type` | `varchar(191)` | no | — |  |
| `added_on` | `date` | no | — |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `merchandiser_replacements_new_salesman_id_foreign` (new_salesman_id)
- index `merchandiser_replacements_old_salesman_id_foreign` (old_salesman_id)
- index `merchandiser_replacements_organisation_id_foreign` (organisation_id)
- primary `primary` (id)

**Foreign keys**

- (new_salesman_id) → `users`(id) on update restrict, on delete restrict
- (old_salesman_id) → `users`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## migrations

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `int(10) unsigned auto_increment` | no | — |  |
| `migration` | `varchar(255)` | no | — |  |
| `batch` | `int(11)` | no | — |  |

**Indexes**

- primary `primary` (id)

## model_has_permissions

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `permission_id` | `bigint(20) unsigned` | no | — |  |
| `model_type` | `varchar(255)` | no | — |  |
| `model_id` | `bigint(20) unsigned` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |

**Indexes**

- index `model_has_permissions_model_id_model_type_index` (model_id, model_type)
- index `model_has_permissions_permission_id_foreign` (permission_id)
- index `model_has_permissions_team_foreign_key_index` (organisation_id)
- primary `primary` (organisation_id, permission_id, model_id, model_type)

**Foreign keys**

- (permission_id) → `permissions`(id) on update restrict, on delete cascade

## model_has_roles

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `role_id` | `bigint(20) unsigned` | no | — |  |
| `model_type` | `varchar(255)` | no | — |  |
| `model_id` | `bigint(20) unsigned` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |

**Indexes**

- index `model_has_roles_model_id_model_type_index` (model_id, model_type)
- index `model_has_roles_role_id_foreign` (role_id)
- index `model_has_roles_team_foreign_key_index` (organisation_id)
- primary `primary` (organisation_id, role_id, model_id, model_type)

**Foreign keys**

- (role_id) → `roles`(id) on update restrict, on delete cascade

## order_details

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `order_id` | `bigint(20) unsigned` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `item_uom_id` | `bigint(20) unsigned` | no | — |  |
| `original_item_uom_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `pricing_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `discount_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `is_free` | `tinyint(1)` | no | `0` |  |
| `is_item_poi` | `tinyint(1)` | no | `0` |  |
| `promotion_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `reason_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `item_qty` | `decimal(18,2)` | no | `0.00` |  |
| `item_weight` | `decimal(8,2)` | no | `0.00` |  |
| `item_price` | `decimal(18,3)` | no | `0.000` |  |
| `item_gross` | `decimal(18,3)` | no | `0.000` | item_qty * item_price |
| `item_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `promotion_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `item_net` | `decimal(18,3)` | no | `0.000` | item_gross - item_discount_amount |
| `item_vat` | `decimal(18,3)` | no | `0.000` |  |
| `item_excise` | `decimal(18,3)` | no | `0.000` |  |
| `item_grand_total` | `decimal(18,3)` | no | `0.000` | item_net + item_vat + item_excise |
| `delivered_qty` | `decimal(18,2)` | no | `0.00` |  |
| `open_qty` | `decimal(18,2)` | no | `0.00` |  |
| `original_item_qty` | `decimal(8,2)` | no | `0.00` |  |
| `original_item_price` | `decimal(18,3)` | no | `0.000` |  |
| `item_vendor_code` | `varchar(191)` | yes | `NULL` |  |
| `request_qty` | `decimal(8,2)` | no | `0.00` |  |
| `order_status` | `enum('Pending','Delivered','Partial-Delivered')` | no | `'Pending'` |  |
| `picking_status` | `enum('partial','full')` | yes | `NULL` |  |
| `transportation_status` | `enum('No','Delegated')` | yes | `NULL` |  |
| `shipment_status` | `enum('partial','full')` | yes | `NULL` |  |
| `invoice_status` | `enum('partial','full')` | yes | `NULL` |  |
| `is_rfgen_sync` | `tinyint(1)` | no | `0` |  |
| `is_deleted` | `tinyint(1)` | no | `0` |  |
| `is_picking` | `tinyint(1)` | no | `0` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `order_details_item_id_foreign` (item_id)
- index `order_details_item_uom_id_index` (item_uom_id)
- index `order_details_order_id_item_id_index` (order_id, item_id)
- index `order_details_reason_id_foreign` (reason_id)
- unique `order_details_uuid_unique` (uuid)
- primary `primary` (id)

**Foreign keys**

- (item_id) → `items`(id) on update restrict, on delete restrict
- (order_id) → `orders`(id) on update restrict, on delete restrict
- (reason_id) → `reason_types`(id) on update restrict, on delete restrict

## orders

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `customer_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `depot_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `order_type_id` | `bigint(20) unsigned` | no | — |  |
| `salesman_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `storage_location_id` | `bigint(20) unsigned` | no | `0` |  |
| `warehouse_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `lob_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `erp_number` | `varchar(50)` | yes | `NULL` |  |
| `customer_lop` | `varchar(191)` | yes | `NULL` |  |
| `order_number` | `varchar(191)` | no | — |  |
| `order_date` | `date` | no | — |  |
| `due_date` | `date` | no | — |  |
| `delivery_date` | `date` | yes | `NULL` |  |
| `change_date` | `date` | yes | `NULL` |  |
| `hold_reason` | `bigint(20)` | yes | `NULL` |  |
| `reason_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `payment_term_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `total_qty` | `decimal(18,2)` | no | `0.00` |  |
| `total_cancel_qty` | `decimal(8,2)` | no | `0.00` |  |
| `total_gross` | `decimal(18,3)` | no | `0.000` |  |
| `total_discount_amount` | `decimal(18,3)` | no | `0.000` |  |
| `total_net` | `decimal(18,3)` | no | `0.000` | total_gross - total_discount_amount |
| `total_vat` | `decimal(18,3)` | no | `0.000` |  |
| `total_excise` | `decimal(18,3)` | no | `0.000` |  |
| `grand_total` | `decimal(18,3)` | no | `0.000` | total_net + total_vat + total_excise |
| `any_comment` | `text` | yes | `NULL` |  |
| `current_stage` | `enum('Pending','Approved','Rejected','In-Process','Partial-Deliver','Completed','Shipping','Cancelled','Picking')` | no | `'Pending'` |  |
| `current_stage_comment` | `text` | yes | `NULL` |  |
| `approval_status` | `enum('Deleted','Created','Updated','In-Process','Shipment','Delivered','Completed','Cancelled','Picking Confirmed','Picked','Truck Allocated')` | yes | `'Created'` |  |
| `sign_image` | `varchar(191)` | yes | `NULL` |  |
| `source` | `int(11)` | no | — | 1:Mobile, 2:Backend, 3:Frontend |
| `status` | `tinyint(1)` | no | `1` |  |
| `is_approved` | `tinyint(1)` | no | `0` |  |
| `sync_status` | `text` | yes | `NULL` |  |
| `order_created_user_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `order_status` | `enum('created','partial','full')` | no | `'created'` |  |
| `order_generate_picking` | `tinyint(1)` | no | `0` |  |
| `invoice_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `picking_status` | `enum('partial','full')` | yes | `NULL` |  |
| `transportation_status` | `enum('No','Delegated')` | yes | `NULL` |  |
| `shipment_status` | `enum('partial','full')` | yes | `NULL` |  |
| `invoice_status` | `enum('partial','full')` | yes | `NULL` |  |
| `is_user_updated` | `tinyint(1)` | no | `0` |  |
| `user_updated` | `bigint(20)` | yes | `NULL` |  |
| `module_updated` | `varchar(191)` | yes | `NULL` |  |
| `is_presale_order` | `tinyint(1)` | no | `0` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `orders_customer_id_foreign` (customer_id)
- index `orders_depot_id_foreign` (depot_id)
- index `orders_invoice_id_index` (invoice_id)
- index `orders_order_created_user_id_foreign` (order_created_user_id)
- index `orders_organisation_id_current_stage_index` (organisation_id, current_stage)
- index `orders_organisation_id_order_date_index` (organisation_id, order_date)
- unique `orders_organisation_id_order_number_unique` (organisation_id, order_number)
- index `orders_organisation_id_status_index` (organisation_id, status)
- unique `orders_organisation_id_uuid_unique` (organisation_id, uuid)
- index `orders_payment_term_id_foreign` (payment_term_id)
- index `orders_reason_id_foreign` (reason_id)
- index `orders_route_id_foreign` (route_id)
- index `orders_salesman_id_foreign` (salesman_id)
- index `orders_warehouse_id_foreign` (warehouse_id)
- primary `primary` (id)

**Foreign keys**

- (customer_id) → `customers`(id) on update restrict, on delete restrict
- (depot_id) → `depots`(id) on update restrict, on delete restrict
- (invoice_id) → `invoices`(id) on update restrict, on delete set null
- (order_created_user_id) → `users`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (payment_term_id) → `payment_terms`(id) on update restrict, on delete restrict
- (reason_id) → `reason_types`(id) on update restrict, on delete restrict
- (route_id) → `routes`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict
- (warehouse_id) → `warehouses`(id) on update restrict, on delete restrict

## organisations

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `reg_software_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `org_name` | `varchar(191)` | no | — |  |
| `org_company_id` | `varchar(191)` | no | — |  |
| `org_tax_id` | `varchar(191)` | yes | `NULL` |  |
| `org_street1` | `varchar(191)` | no | — |  |
| `org_street2` | `varchar(191)` | yes | `NULL` |  |
| `org_city` | `varchar(191)` | yes | `NULL` |  |
| `org_state` | `varchar(191)` | yes | `NULL` |  |
| `org_country_id` | `int(11)` | no | — |  |
| `org_postal` | `varchar(191)` | yes | `NULL` |  |
| `org_phone` | `varchar(191)` | no | — |  |
| `org_contact_person` | `varchar(191)` | yes | `NULL` |  |
| `org_contact_person_number` | `varchar(191)` | yes | `NULL` |  |
| `org_currency` | `varchar(191)` | no | `'USD'` |  |
| `org_fasical_year` | `varchar(191)` | yes | `NULL` |  |
| `is_batch_enabled` | `tinyint(1)` | no | `0` |  |
| `is_credit_limit_enabled` | `tinyint(1)` | no | `0` |  |
| `org_logo` | `varchar(191)` | no | `'assets/organisation/no-image.png'` |  |
| `gstin_number` | `varchar(50)` | no | — |  |
| `gst_reg_date` | `varchar(50)` | no | — |  |
| `is_auto_approval_set` | `tinyint(1)` | no | `0` |  |
| `org_status` | `tinyint(1)` | no | `1` |  |
| `is_trial_period` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)

## outlet_product_codes

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `code` | `varchar(191)` | no | — |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `outlet_product_codes_organisation_id_foreign` (organisation_id)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## pallets

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `date` | `date` | no | — |  |
| `salesman_id` | `bigint(20) unsigned` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `division_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `warehouse_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `qty` | `decimal(18,2)` | no | `0.00` |  |
| `pallet_type` | `enum('allocated','return')` | no | `'allocated'` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `pallets_division_id_foreign` (division_id)
- index `pallets_item_id_foreign` (item_id)
- index `pallets_organisation_id_pallet_type_index` (organisation_id, pallet_type)
- index `pallets_organisation_id_salesman_id_index` (organisation_id, salesman_id)
- unique `pallets_organisation_id_uuid_unique` (organisation_id, uuid)
- index `pallets_salesman_id_foreign` (salesman_id)
- index `pallets_warehouse_id_foreign` (warehouse_id)
- primary `primary` (id)

**Foreign keys**

- (division_id) → `divisions`(id) on update restrict, on delete restrict
- (item_id) → `items`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict
- (warehouse_id) → `warehouses`(id) on update restrict, on delete restrict

## password_reset_tokens

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `email` | `varchar(255)` | no | — |  |
| `token` | `varchar(255)` | no | — |  |
| `created_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (email)

## payment_terms

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `payment_code` | `varchar(191)` | yes | `NULL` |  |
| `number_of_days` | `int(11)` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `payment_terms_organisation_id_status_index` (organisation_id, status)
- unique `payment_terms_organisation_id_uuid_unique` (organisation_id, uuid)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## pdp_items

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `pdp_plan_id` | `bigint(20) unsigned` | no | — |  |
| `row_type` | `enum('order','offer')` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `uom_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `quantity` | `decimal(12,2)` | yes | `NULL` |  |
| `price` | `decimal(12,2)` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `pdp_items_item_id_foreign` (item_id)
- index `pdp_items_plan_row_type_idx` (pdp_plan_id, row_type)
- index `pdp_items_uom_id_foreign` (uom_id)
- unique `pdp_items_uuid_unique` (uuid)
- primary `primary` (id)

**Foreign keys**

- (item_id) → `items`(id) on update restrict, on delete restrict
- (pdp_plan_id) → `pdp_plans`(id) on update restrict, on delete cascade
- (uom_id) → `item_uoms`(id) on update restrict, on delete restrict

## pdp_key_combinations

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `signature` | `varchar(191)` | no | — |  |
| `name` | `varchar(191)` | yes | `NULL` |  |
| `keys` | `longtext` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- unique `pdp_key_combinations_organisation_id_signature_unique` (organisation_id, signature)
- unique `pdp_key_combinations_uuid_unique` (uuid)
- primary `primary` (id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete cascade

## pdp_plans

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `type` | `enum('pricing','promotion','discount')` | no | — |  |
| `discount_main_type` | `varchar(20)` | yes | `NULL` |  |
| `discount_apply_on` | `varchar(10)` | yes | `NULL` |  |
| `pdp_key_combination_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `name` | `varchar(191)` | no | — |  |
| `start_date` | `date` | no | — |  |
| `end_date` | `date` | no | — |  |
| `offer_type` | `enum('free_goods','percentage','fixed')` | yes | `NULL` |  |
| `offer_value` | `decimal(12,2)` | yes | `NULL` |  |
| `order_item_type` | `varchar(10)` | yes | `NULL` |  |
| `is_repeat` | `tinyint(1)` | no | `1` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `pdp_plans_pdp_key_combination_id_foreign` (pdp_key_combination_id)
- index `pricing_promotion_rules_organisation_id_type_status_index` (organisation_id, type, status)
- unique `pricing_promotion_rules_organisation_id_uuid_unique` (organisation_id, uuid)
- primary `primary` (id)

**Foreign keys**

- (pdp_key_combination_id) → `pdp_key_combinations`(id) on update restrict, on delete set null
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## pdp_slabs

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `pdp_plan_id` | `bigint(20) unsigned` | no | — |  |
| `min_slab` | `decimal(12,2)` | no | — |  |
| `max_slab` | `decimal(12,2)` | no | — |  |
| `value` | `decimal(12,2)` | yes | `NULL` |  |
| `percentage` | `decimal(5,2)` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `pdp_slabs_pdp_plan_id_foreign` (pdp_plan_id)
- primary `primary` (id)

**Foreign keys**

- (pdp_plan_id) → `pdp_plans`(id) on update restrict, on delete cascade

## pdp_values

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `pdp_plan_id` | `bigint(20) unsigned` | no | — |  |
| `valueable_type` | `varchar(255)` | no | — |  |
| `valueable_id` | `bigint(20) unsigned` | no | — |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- unique `pdp_values_unique` (pdp_plan_id, valueable_type, valueable_id)
- index `pdp_values_valueable_type_valueable_id_index` (valueable_type, valueable_id)
- primary `primary` (id)

**Foreign keys**

- (pdp_plan_id) → `pdp_plans`(id) on update restrict, on delete cascade

## permissions

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `name` | `varchar(255)` | no | — |  |
| `guard_name` | `varchar(255)` | no | — |  |
| `module` | `varchar(255)` | yes | `NULL` |  |
| `action` | `varchar(255)` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- unique `permissions_name_guard_name_unique` (name, guard_name)
- primary `primary` (id)

## personal_access_tokens

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `tokenable_type` | `varchar(255)` | no | — |  |
| `tokenable_id` | `bigint(20) unsigned` | no | — |  |
| `name` | `text` | no | — |  |
| `token` | `varchar(64)` | no | — |  |
| `abilities` | `text` | yes | `NULL` |  |
| `last_used_at` | `timestamp` | yes | `NULL` |  |
| `expires_at` | `timestamp` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- index `personal_access_tokens_expires_at_index` (expires_at)
- index `personal_access_tokens_tokenable_type_tokenable_id_index` (tokenable_type, tokenable_id)
- unique `personal_access_tokens_token_unique` (token)
- primary `primary` (id)

## product_catalogs

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `barcode` | `varchar(191)` | yes | `NULL` |  |
| `net_weight` | `decimal(18,2)` | yes | `NULL` |  |
| `flawer` | `varchar(191)` | yes | `NULL` |  |
| `shelf_file` | `varchar(191)` | yes | `NULL` |  |
| `ingredients` | `varchar(191)` | yes | `NULL` |  |
| `energy` | `varchar(191)` | yes | `NULL` |  |
| `fat` | `varchar(191)` | yes | `NULL` |  |
| `protein` | `varchar(191)` | yes | `NULL` |  |
| `carbohydrate` | `varchar(191)` | yes | `NULL` |  |
| `calcium` | `varchar(191)` | yes | `NULL` |  |
| `sodium` | `varchar(191)` | yes | `NULL` |  |
| `potassium` | `varchar(191)` | yes | `NULL` |  |
| `crude_fibre` | `varchar(191)` | yes | `NULL` |  |
| `vitamin` | `varchar(191)` | yes | `NULL` |  |
| `image_string` | `varchar(191)` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `product_catalogs_item_id_foreign` (item_id)
- index `product_catalogs_organisation_id_foreign` (organisation_id)

**Foreign keys**

- (item_id) → `items`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## reason_types

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `type` | `enum('Non Service Reason','Good Return Reason','Bad Return Reason','Debit Note Reason','Visit Reason','Receipt Reason','Order','Delivery','CreditNote','SalesmanLoad','GoodReturnNote','Order Process Reason','Delivery Reason')` | no | — |  |
| `code` | `varchar(191)` | yes | `NULL` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `reason_types_organisation_id_foreign` (organisation_id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## regions

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `country_id` | `bigint(20) unsigned` | no | — |  |
| `region_code` | `varchar(191)` | no | — |  |
| `region_name` | `varchar(191)` | no | — |  |
| `region_status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `regions_country_id_foreign` (country_id)
- index `regions_organisation_id_foreign` (organisation_id)

**Foreign keys**

- (country_id) → `countries`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## role_has_permissions

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `permission_id` | `bigint(20) unsigned` | no | — |  |
| `role_id` | `bigint(20) unsigned` | no | — |  |

**Indexes**

- primary `primary` (permission_id, role_id)
- index `role_has_permissions_role_id_foreign` (role_id)

**Foreign keys**

- (permission_id) → `permissions`(id) on update restrict, on delete cascade
- (role_id) → `roles`(id) on update restrict, on delete cascade

## roles

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `uuid` | `uuid` | yes | `NULL` |  |
| `code` | `varchar(255)` | yes | `NULL` |  |
| `name` | `varchar(255)` | no | — |  |
| `description` | `text` | yes | `NULL` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `guard_name` | `varchar(255)` | no | — |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- unique `roles_organisation_id_name_guard_name_unique` (organisation_id, name, guard_name)
- index `roles_team_foreign_key_index` (organisation_id)

## routes

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `area_id` | `bigint(20) unsigned` | no | — |  |
| `depot_id` | `bigint(20) unsigned` | no | — |  |
| `route_code` | `varchar(50)` | no | — |  |
| `route_name` | `varchar(255)` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `routes_area_id_foreign` (area_id)
- index `routes_depot_id_foreign` (depot_id)
- index `routes_organisation_id_route_code_index` (organisation_id, route_code)
- index `routes_organisation_id_status_index` (organisation_id, status)
- unique `routes_organisation_id_uuid_unique` (organisation_id, uuid)

**Foreign keys**

- (area_id) → `areas`(id) on update restrict, on delete cascade
- (depot_id) → `depots`(id) on update restrict, on delete cascade
- (organisation_id) → `organisations`(id) on update restrict, on delete cascade

## sales_organisations

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `parent_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `name` | `varchar(191)` | no | — |  |
| `node_level` | `int(10) unsigned` | no | `0` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `sales_organisations_organisation_id_foreign` (organisation_id)
- index `sales_organisations_parent_id_foreign` (parent_id)
- unique `sales_organisations_uuid_unique` (uuid)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete cascade
- (parent_id) → `sales_organisations`(id) on update restrict, on delete cascade

## salesman_infos

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `user_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `region_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `salesman_helper_id` | `bigint(20) unsigned` | yes | `NULL` | It's coming from users table |
| `salesman_type_id` | `bigint(20) unsigned` | yes | `NULL` | 1:Salesman, 2:Merchandiser |
| `salesman_role_id` | `bigint(20) unsigned` | yes | `NULL` | 1: Presales, 2:Vansales, 3: Hybrid, 4: Delivery, 5: Merchandiser |
| `designation` | `varchar(191)` | yes | `NULL` |  |
| `category_id` | `varchar(50)` | yes | `NULL` | 1: Salesman, 2: Salesman cum driver, 3: Helper, 4: Driver cum helper |
| `salesman_code` | `varchar(20)` | no | — |  |
| `employee_code` | `varchar(50)` | yes | `NULL` |  |
| `salesman_supervisor` | `varchar(191)` | yes | `NULL` |  |
| `supervisor_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `date_of_joning` | `date` | yes | `NULL` |  |
| `is_block` | `tinyint(1)` | no | `0` |  |
| `block_start_date` | `date` | yes | `NULL` |  |
| `block_end_date` | `date` | yes | `NULL` |  |
| `status` | `tinyint(1)` | no | `0` |  |
| `profile_image` | `varchar(191)` | yes | `NULL` |  |
| `incentive` | `decimal(8,3)` | no | `0.000` |  |
| `current_stage` | `enum('Pending','Approved','Rejected')` | no | `'Pending'` |  |
| `current_stage_comment` | `text` | yes | `NULL` |  |
| `printer_config` | `int(11)` | no | `1` | 1: Zebra, 2: honeywell |
| `geo_flag` | `int(11)` | no | `0` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `salesman_infos_organisation_id_foreign` (organisation_id)
- index `salesman_infos_supervisor_id_foreign` (supervisor_id)
- index `salesman_infos_user_id_foreign` (user_id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (supervisor_id) → `users`(id) on update restrict, on delete restrict
- (user_id) → `users`(id) on update restrict, on delete restrict

## salesman_load_details

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `salesman_load_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `depot_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `item_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `salesman_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `storage_location_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `warehouse_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `van_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `dat_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `load_date` | `date` | no | — |  |
| `change_date` | `date` | yes | `NULL` |  |
| `item_uom` | `varchar(191)` | no | — |  |
| `load_qty` | `varchar(191)` | no | — |  |
| `lower_qty` | `decimal(8,2)` | no | `0.00` |  |
| `ctn_qty` | `decimal(18,2)` | no | `0.00` |  |
| `requested_qty` | `decimal(18,2)` | no | `0.00` |  |
| `requested_item_uom_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `is_exported` | `enum('No','Yes')` | no | `'No'` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `salesman_load_details_depot_id_foreign` (depot_id)
- index `salesman_load_details_item_id_foreign` (item_id)
- index `salesman_load_details_route_id_foreign` (route_id)
- index `salesman_load_details_salesman_id_foreign` (salesman_id)
- index `salesman_load_details_salesman_load_id_item_id_index` (salesman_load_id, item_id)
- unique `salesman_load_details_uuid_unique` (uuid)
- index `salesman_load_details_van_id_foreign` (van_id)
- index `salesman_load_details_warehouse_id_foreign` (warehouse_id)

**Foreign keys**

- (depot_id) → `depots`(id) on update restrict, on delete restrict
- (item_id) → `items`(id) on update restrict, on delete restrict
- (route_id) → `routes`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict
- (salesman_load_id) → `salesman_loads`(id) on update restrict, on delete restrict
- (van_id) → `vans`(id) on update restrict, on delete restrict
- (warehouse_id) → `warehouses`(id) on update restrict, on delete restrict

## salesman_loads

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `load_number` | `varchar(191)` | no | — |  |
| `depot_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `trip_id` | `bigint(20)` | yes | `NULL` |  |
| `trip_number` | `smallint(6)` | no | `1` |  |
| `van_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `delivery_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `order_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `salesman_id` | `bigint(20) unsigned` | no | — |  |
| `storage_location_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `warehouse_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `load_date` | `date` | no | — |  |
| `load_type` | `bigint(20) unsigned` | yes | `NULL` | 1: Delivery Load 2: Van Load |
| `load_confirm` | `tinyint(1)` | no | `1` | 0 Pending, 1 Confirm |
| `status` | `tinyint(1)` | no | `1` |  |
| `approval_status` | `enum('Deleted','Created','Updated','In-Process','Completed','Cancel','Shipment','Truck Allocated','Picked')` | no | `'Created'` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `salesman_loads_delivery_id_foreign` (delivery_id)
- index `salesman_loads_depot_id_foreign` (depot_id)
- index `salesman_loads_order_id_foreign` (order_id)
- index `salesman_loads_organisation_id_approval_status_index` (organisation_id, approval_status)
- index `salesman_loads_organisation_id_load_date_index` (organisation_id, load_date)
- unique `salesman_loads_organisation_id_load_number_unique` (organisation_id, load_number)
- index `salesman_loads_organisation_id_status_index` (organisation_id, status)
- unique `salesman_loads_organisation_id_uuid_unique` (organisation_id, uuid)
- index `salesman_loads_route_id_foreign` (route_id)
- index `salesman_loads_salesman_id_foreign` (salesman_id)
- index `salesman_loads_van_id_foreign` (van_id)
- index `salesman_loads_warehouse_id_foreign` (warehouse_id)

**Foreign keys**

- (delivery_id) → `deliveries`(id) on update restrict, on delete restrict
- (depot_id) → `depots`(id) on update restrict, on delete restrict
- (order_id) → `orders`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (route_id) → `routes`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict
- (van_id) → `vans`(id) on update restrict, on delete restrict
- (warehouse_id) → `warehouses`(id) on update restrict, on delete restrict

## salesman_unload_details

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `salesman_unload_id` | `bigint(20) unsigned` | no | — |  |
| `item_id` | `bigint(20) unsigned` | no | — |  |
| `item_uom_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `unload_qty` | `decimal(18,2)` | no | `0.00` |  |
| `unload_type` | `enum('fresh','damage','expired')` | no | `'fresh'` |  |
| `reason_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `salesman_unload_details_item_id_foreign` (item_id)
- index `salesman_unload_details_salesman_unload_id_item_id_index` (salesman_unload_id, item_id)
- unique `salesman_unload_details_uuid_unique` (uuid)

**Foreign keys**

- (item_id) → `items`(id) on update restrict, on delete restrict
- (salesman_unload_id) → `salesman_unloads`(id) on update restrict, on delete restrict

## salesman_unloads

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `unload_number` | `varchar(191)` | no | — |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `warehouse_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `van_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `salesman_id` | `bigint(20) unsigned` | no | — |  |
| `transaction_date` | `date` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `approval_status` | `enum('Created','Updated','Deleted')` | no | `'Created'` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `salesman_unloads_organisation_id_status_index` (organisation_id, status)
- index `salesman_unloads_organisation_id_transaction_date_index` (organisation_id, transaction_date)
- unique `salesman_unloads_organisation_id_unload_number_unique` (organisation_id, unload_number)
- unique `salesman_unloads_organisation_id_uuid_unique` (organisation_id, uuid)
- index `salesman_unloads_route_id_foreign` (route_id)
- index `salesman_unloads_salesman_id_foreign` (salesman_id)
- index `salesman_unloads_van_id_foreign` (van_id)
- index `salesman_unloads_warehouse_id_foreign` (warehouse_id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (route_id) → `routes`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict
- (van_id) → `vans`(id) on update restrict, on delete restrict
- (warehouse_id) → `warehouses`(id) on update restrict, on delete restrict

## sensory_surveys

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `survey_code` | `varchar(191)` | no | — |  |
| `survey_name` | `varchar(191)` | no | — |  |
| `product_id` | `bigint(20) unsigned` | no | — |  |
| `customer_id` | `bigint(20) unsigned` | no | — |  |
| `salesman_id` | `bigint(20) unsigned` | no | — |  |
| `date` | `date` | no | — |  |
| `appearance` | `decimal(4,1)` | no | `0.0` |  |
| `aroma` | `decimal(4,1)` | no | `0.0` |  |
| `taste` | `decimal(4,1)` | no | `0.0` |  |
| `texture` | `decimal(4,1)` | no | `0.0` |  |
| `overall_rating` | `decimal(4,1)` | no | `0.0` |  |
| `comments` | `text` | yes | `NULL` |  |
| `status` | `enum('draft','completed')` | no | `'draft'` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `sensory_surveys_customer_id_foreign` (customer_id)
- index `sensory_surveys_organisation_id_status_index` (organisation_id, status)
- unique `sensory_surveys_organisation_id_survey_code_unique` (organisation_id, survey_code)
- unique `sensory_surveys_organisation_id_uuid_unique` (organisation_id, uuid)
- index `sensory_surveys_product_id_foreign` (product_id)
- index `sensory_surveys_salesman_id_foreign` (salesman_id)

**Foreign keys**

- (customer_id) → `customers`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (product_id) → `items`(id) on update restrict, on delete restrict
- (salesman_id) → `users`(id) on update restrict, on delete restrict

## sessions

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `varchar(255)` | no | — |  |
| `user_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `ip_address` | `varchar(45)` | yes | `NULL` |  |
| `user_agent` | `text` | yes | `NULL` |  |
| `payload` | `longtext` | no | — |  |
| `last_activity` | `int(11)` | no | — |  |

**Indexes**

- primary `primary` (id)
- index `sessions_last_activity_index` (last_activity)
- index `sessions_user_id_index` (user_id)

## tax_rates

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `rate` | `varchar(191)` | no | — |  |
| `type` | `varchar(50)` | no | — |  |
| `is_default` | `tinyint(1)` | no | `0` |  |
| `description` | `text` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `tax_rates_organisation_id_foreign` (organisation_id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## user_credit_limits

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `user_id` | `bigint(20) unsigned` | no | — |  |
| `credit_limit_type` | `bigint(20)` | no | — | 1=Customer Base; 2=LOB |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `user_credit_limits_organisation_id_foreign` (organisation_id)
- index `user_credit_limits_user_id_foreign` (user_id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (user_id) → `users`(id) on update restrict, on delete restrict

## users

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `usertype` | `bigint(20) unsigned` | no | `1` | 0:superadmin, 1:admin (organisation), 2:customer, 3:salesman... |
| `parent_id` | `varchar(191)` | yes | `NULL` | If the user type is admin then put the admin id here to make it as a group. |
| `firstname` | `varchar(191)` | no | — |  |
| `lastname` | `varchar(191)` | no | `''` |  |
| `email` | `varchar(191)` | no | `''` |  |
| `password` | `varchar(191)` | no | — |  |
| `api_token` | `varchar(191)` | no | — |  |
| `email_verified_at` | `timestamp` | yes | `NULL` |  |
| `mobile` | `varchar(191)` | yes | `NULL` |  |
| `country_id` | `int(11)` | yes | `NULL` |  |
| `is_approved_by_admin` | `tinyint(1)` | no | `1` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `id_stripe` | `varchar(191)` | yes | `NULL` |  |
| `login_type` | `enum('system','google','facebook','twitter','mobile')` | no | — |  |
| `role_id` | `bigint(20) unsigned` | no | `2` |  |
| `remember_token` | `varchar(100)` | yes | `NULL` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |
| `invited_by` | `bigint(20) unsigned` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- unique `users_api_token_unique` (api_token)
- index `users_invited_by_foreign` (invited_by)
- index `users_organisation_id_foreign` (organisation_id)
- index `users_role_id_foreign` (role_id)

**Foreign keys**

- (invited_by) → `users`(id) on update restrict, on delete set null
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## van_categories

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `parent_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `node_level` | `bigint(20)` | no | `0` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `van_categories_organisation_id_foreign` (organisation_id)
- index `van_categories_parent_id_foreign` (parent_id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (parent_id) → `van_categories`(id) on update restrict, on delete restrict

## van_types

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `parent_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `node_level` | `bigint(20)` | no | `0` |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `van_types_organisation_id_foreign` (organisation_id)
- index `van_types_parent_id_foreign` (parent_id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (parent_id) → `van_types`(id) on update restrict, on delete restrict

## vans

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `van_code` | `varchar(25)` | no | — |  |
| `plate_number` | `varchar(15)` | no | — |  |
| `description` | `varchar(255)` | yes | `NULL` |  |
| `capacity` | `int(11)` | yes | `NULL` |  |
| `van_type_id` | `int(11)` | no | — |  |
| `van_category_id` | `int(11)` | yes | `NULL` |  |
| `van_status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |
| `area_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `reading` | `int(11)` | no | `0` |  |

**Indexes**

- primary `primary` (id)
- index `vans_area_id_foreign` (area_id)
- index `vans_organisation_id_foreign` (organisation_id)

**Foreign keys**

- (area_id) → `areas`(id) on update restrict, on delete set null
- (organisation_id) → `organisations`(id) on update restrict, on delete cascade

## warehouses

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `code` | `varchar(191)` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `address` | `varchar(191)` | yes | `NULL` |  |
| `manager` | `varchar(191)` | yes | `NULL` |  |
| `manager_phone` | `varchar(191)` | yes | `NULL` |  |
| `is_main` | `tinyint(1)` | no | `0` |  |
| `loc_type` | `int(11)` | yes | `NULL` |  |
| `lat` | `varchar(191)` | yes | `NULL` |  |
| `lang` | `varchar(191)` | yes | `NULL` |  |
| `depot_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `route_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `parent_warehouse_id` | `bigint(20) unsigned` | yes | `NULL` |  |
| `status` | `tinyint(1)` | yes | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `warehouses_depot_id_foreign` (depot_id)
- index `warehouses_organisation_id_foreign` (organisation_id)
- index `warehouses_parent_warehouse_id_foreign` (parent_warehouse_id)
- index `warehouses_route_id_foreign` (route_id)

**Foreign keys**

- (depot_id) → `depots`(id) on update restrict, on delete restrict
- (organisation_id) → `organisations`(id) on update restrict, on delete restrict
- (parent_warehouse_id) → `warehouses`(id) on update restrict, on delete restrict
- (route_id) → `routes`(id) on update restrict, on delete restrict

## work_flow_rule_approvers

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `work_flow_rule_id` | `bigint(20) unsigned` | no | — |  |
| `role_id` | `bigint(20) unsigned` | no | — |  |
| `user_id` | `bigint(20) unsigned` | no | — |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `work_flow_rule_approvers_role_id_foreign` (role_id)
- index `work_flow_rule_approvers_user_id_foreign` (user_id)
- index `work_flow_rule_approvers_work_flow_rule_id_foreign` (work_flow_rule_id)

**Foreign keys**

- (user_id) → `users`(id) on update restrict, on delete restrict
- (work_flow_rule_id) → `work_flow_rules`(id) on update restrict, on delete cascade

## work_flow_rules

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `organisation_id` | `bigint(20) unsigned` | no | — |  |
| `name` | `varchar(191)` | no | — |  |
| `module` | `varchar(100)` | no | — |  |
| `description` | `text` | yes | `NULL` |  |
| `event_trigger` | `enum('created','edited','created_or_edited','deleted')` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |
| `deleted_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)
- index `work_flow_rules_organisation_id_foreign` (organisation_id)

**Foreign keys**

- (organisation_id) → `organisations`(id) on update restrict, on delete restrict

## zones

| Column | Type | Nullable | Default | Comment |
|---|---|---|---|---|
| `id` | `bigint(20) unsigned auto_increment` | no | — |  |
| `uuid` | `uuid` | no | — |  |
| `zone_code` | `varchar(50)` | yes | `NULL` |  |
| `name` | `varchar(191)` | no | — |  |
| `status` | `tinyint(1)` | no | `1` |  |
| `created_at` | `timestamp` | yes | `NULL` |  |
| `updated_at` | `timestamp` | yes | `NULL` |  |

**Indexes**

- primary `primary` (id)

