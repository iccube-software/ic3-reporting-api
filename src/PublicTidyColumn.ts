import {
    AxisCoordinate,
    EntityItem,
    IMdxAxisSeriesInfo,
    ITidyColumnsSource,
    ITidyTableSelection,
    MdxInfo,
    MdxMemberCoordinates,
    SortingType,
    TidyCellError,
    TidyColumnCoordinateUniqueName,
    TidyColumnsType,
} from "./PublicTidyTableTypes";
import {TidyActionEvent} from "./IcEvent";
import {ReactElement} from "react";
import {ThemeTextFormatter} from "./PublicTheme";
import {Property} from "csstype";
import {AppNotification} from "./INotification";
import {ITidyTable} from "./PublicTidyTable";

/**
 * Properties with a special meaning
 */
export enum ITidyColumnNamedProperties {

    /**
     * The formatted value of a cell. For example, 5003 in euros is formatted as €5,003
     */
    mdxCellFormattedValue = "formattedValue",

    /**
     * MDX related colorings
     */
    mdxCellBackColor = "mdxCellBackColor",

    /**
     * MDX related colorings
     */
    mdxCellForeColor = "mdxCellForeColor",

    /**
     * The format string for the cell value. For example, euros are formatted using €#,###.
     * and percentages using #0.00%.
     */
    mdxCellFormatString = "mdxCellFormatString",

    /**
     * The main color of the cell
     */
    mdxCellColor = "color",

    /**
     * Column defined to fire an app. notification.
     *
     * The name of the notification (e.g., print-report).
     */
    appNotificationType = "appNotificationType",

    /**
     * Column defined to fire an app. notification.
     *
     * The parameters of the notification (e.g., page size, filename, ...) as a JSON or a string.
     */
    appNotificationPayload = "appNotificationPayload",

    /**
     * Column defined to fire events, the name of the event
     */
    eventName = "eventName",

    /**
     * Column defined to fire events, the value of the event (e.g. used in title)
     */
    eventValue = "eventValue",

    /**
     * Column defined to fire events, the mdx value of the event (e.g. used in queries)
     */
    eventMdxValue = "eventMdxValue",

    /**
     * Column defined as an MDX axis, the unique name of the column  (the name is the value of the column)
     */
    uniqueName = "uniqueName",

    /**
     * Column defined as an MDX axis, the caption of the column
     */
    caption = "caption",

    /**
     * Column defined as an MDX axis, the key of the column
     */
    mdxCellKey = "key",

    /**
     * Show this when hovering over the cell (or the visualisation representing the cell)
     */
    tooltip = "tooltip",
}

/**
 * A copy from XLSX CellObject (we don't want the link to the library !)
 */
export interface ITidyColumnXlsxCell {
    /** The raw value of the cell.  Can be omitted if a formula is specified */
    v?: string | number | boolean | Date;

    /** Formatted text (if applicable) */
    w?: string;

    /**
     * The Excel Data Type of the cell.
     * b Boolean, n Number, e Error, s String, d Date, z Empty
     */
    t: 'b' | 'n' | 'e' | 's' | 'd' | 'z';

    /** Cell formula (if applicable) */
    f?: string;

    /** Range of enclosing array if formula is array formula (if applicable) */
    F?: string;

    /** Rich text encoding (if applicable) */
    r?: any;

    /** HTML rendering of the rich text (if applicable) */
    h?: string;

    /** Number format string associated with the cell (if requested) */
    z?: string | number;

    /** Cell hyperlink object (.Target holds link, .tooltip is tooltip) */
    l?: {
        /** Target of the link (HREF) */
        Target: string;

        /** Plaintext tooltip to display when mouse is over cell */
        Tooltip?: string;
    };

    /** The style/theme of the cell (if applicable) */
    s?: any;
}

type NonNullable<T> = Exclude<T, null | undefined>;  // Remove null and undefined from T
export type AllowedColumnType<T> = TidyColumnsType.UNKNOWN
    | TidyColumnsType.MIXED
    | (NonNullable<T> extends Property.Color ? TidyColumnsType.COLOR : TidyColumnsType.UNKNOWN)
    | (NonNullable<T> extends string ? TidyColumnsType.CHARACTER : TidyColumnsType.UNKNOWN)
    | (NonNullable<T> extends number ? TidyColumnsType.NUMERIC | TidyColumnsType.LATITUDE | TidyColumnsType.LONGITUDE : TidyColumnsType.UNKNOWN)
    | (NonNullable<T> extends boolean ? TidyColumnsType.LOGICAL : TidyColumnsType.UNKNOWN)
    | (NonNullable<T> extends any[] ? TidyColumnsType.LIST : TidyColumnsType.UNKNOWN)
    | (NonNullable<T> extends Date ? TidyColumnsType.DATETIME : TidyColumnsType.UNKNOWN)
    | (NonNullable<T> extends unknown ? TidyColumnsType : TidyColumnsType.UNKNOWN)
    | (T extends null ? TidyColumnsType.NULL : TidyColumnsType.UNKNOWN);

/**
 * Base interface for nullable column.
 */
export interface ITidyBaseColumn<T> {

    /**
     * Returns the name of the column.
     */
    getName(): string;

    /**
     * Set the name of the column.
     * @param name set this as the caption of the column.
     *
     * Note, do not use this for columns that are in tables as it can cause duplicate columns in a table.
     * Use setCaption to change the name visible to the user.
     */
    setName(name: string): void;

    /**
     * Returns the caption of the column. The caption is used for displaying localised
     * or custom captions for the axis, header, etc.
     */
    getCaption(): string;

    /**
     * Set the caption of the column. The caption is used for displaying localised
     * or custom captions for the axis, header, etc.
     * @param caption set this as the caption of the column.
     */
    setCaption(caption: string): void;

    /**
     * Get the value of the column at position idx.
     * @param idx the position to return the value of.
     */
    getValue(idx: number): T;

    /**
     * Set the value of a column at a certain index.
     * @param idx row index.
     * @param newValue new value for the column.
     */
    setValue(idx: number, newValue: T): void;

    /**
     * Add a value to the column making the length of the column 1 longer.
     * @param value
     */
    pushValue(value: T): void;

    /**
     * Get cell as expected by xlsx library (do not include the interface as it's lazy loaded !)
     *
     * @param idx the position to return the value of.
     */
    getExcelCell(idx: number): ITidyColumnXlsxCell | undefined;

    /**
     * Get the formatted value of the column at position idx.
     *
     * undefined - if the formatted_value is not available
     * null - if it's empty
     *
     * @param idx the position to return the value of.
     */
    getFormattedValue(idx: number): string | undefined;

    /**
     * Get the source of the column
     */
    getSource(): ITidyColumnsSource;

    /**
     * Get the source of the column
     */
    setSource(source: ITidyColumnsSource): void;

    /**
     * Return the formatted value. Fallback on the value itself.
     */
    getFormattedValueOrValue(idx: number): string | undefined;

    /**
     * Set the number formatter of the column, calculating and adding the 'formattedValue' property.
     */
    setNumberFormat(format: ThemeTextFormatter | undefined): void;

    /**
     * Set the formatted values. Use this if you have the formatted values pre-calculated or a function to calculate
     * the formatted values.
     */
    setFormattedValues(formattedValues: (string | null)[] | ((value: T | undefined) => string)): void;

    /**
     * Returns the formatter of the column.
     */
    getNumberFormat(): ThemeTextFormatter | undefined;

    getNumberFormatInfo(): string | undefined;

    /**
     * Returns the column values.
     */
    getValues(): Array<T>;

    /**
     * Set the values of this column. Ensure that the length remains the same, if not, an error is thrown.
     * @param values new values of the column.
     */
    setValues<P>(values: P[]): void;

    /**
     * Return a new column with transformed values.
     * @param fun function with one parameter. Describes the transformation.
     * @param columnName the name of the new column.
     * @param newType new type for the column. Leave blank for auto inference of the type.
     */
    mapToColumn<P>(fun: (value: T, index: number) => P, columnName: string, newType?: AllowedColumnType<P>): ITidyBaseColumn<P>;

    /**
     * Apply a transformation to all values in the column. Note, this functions alters the values in the column.
     * @param fun function with one parameter. Describes the transformation. In the function, index represents the
     * index of the internal data structure.
     * @param newType new type for the column. Leave blank for auto inference of the type.
     */
    apply<P>(fun: (value: T, index: number) => P, newType?: AllowedColumnType<P>): void;

    /**
     * Fill the column with a single value.
     */
    fill<P>(value: P): void;

    /**
     * Get the unique values in this column.
     */
    unique(): T[];

    /**
     * Get the axis values in this column.
     *
     * If it's an MDX Axis, the potentially sorted MDX axis (e.g. pivot table sort)
     *
     * If it's not, return undefined
     */
    mdxAxis(): T[] | undefined;

    /**
     *
     * if it's an mdx axis, for each row of the undelying mdx Axis
     * if no, for each row
     *
     * @see mdxAxis
     */
    mapAxisOrRows<K>(callbackfn: (rowIdx: number, column: ITidyBaseColumn<T>) => K): K[];

    /**
     * Get the array of mdx info in the column. Returns an empty array if there is no mdx info.
     */
    getMdxInfos(): MdxInfo[];

    /**
     * Returns true if and only if the column has zero rows.
     */
    isEmpty(): boolean;

    /**
     * Returns the length of the value array.
     */
    length(): number;

    /**
     * Sort the values of the column. Edge cases such as NaN and null are sorted to the end of the column.
     * Sort ascending by default.
     */
    sort(order?: SortingType): void;

    /**
     * Get the ranking of the values. Smallest value gets rank 0,
     * second smallest rank 1, etc. until rank n-1. Sort ascending by default.
     * @param order sorting order. Default = ascending.
     */
    getRank(order?: SortingType): number[];

    /**
     * Export the column as a flat object.
     */
    toChartData(): { [key: string]: T }[];

    /**
     * Returns the mdx info at a row index.
     *
     * If the column is an axis (e.g. measure one), it's the same for all rows
     */
    getMdxInfo(idx: number): MdxInfo;

    isWithEntityItem(): boolean;

    /**
     * Create and return the entity item at position idx for generating events
     */
    getEntityItem(idx: number): EntityItem;

    /**
     * Get the mdx coordinates of the cell at rowIdx
     */
    getMdxCoordinates(rowIdx: number): MdxMemberCoordinates | undefined;

    /**
     * Returns true if the column is a hierarchical structure
     */
    isHierarchy(): boolean;

    /**
     * Get the index of the parent. Returns idx if there is no hierarchy.
     * @param idx the index to find the parent of.
     */
    getParentIdx(idx: number): number;

    /**
     * Returns true if the entry at position idx does not have children
     * @param idx the position to check
     */
    isLeaf(idx: number): boolean;

    /**
     * Get the indices of the level 0 children of this node. Returns [] if the
     * column is not a hierarchy.
     * @param idx
     */
    getLeaves(idx: number): number[];

    /**
     * Return the descendants of the node in the hierarchy at the index.
     * Returned set excludes the node itself.
     * @param index
     */
    getDescendants(index: number): number[];

    /**
     * Returns the children of the node in the hierarchy. Excludes the node itself.
     * @param index
     */
    getChildren(index: number): number[];

    /**
     * Return the siblings of the node in the hierarchy at the index.
     * Including the node itself.
     * @param index
     */
    getSiblings(index: number): number[];

    /**
     * @param callbackfn  , if the return value is undefined do not map the row
     * @param forceMapAllRows
     */
    mapAllRows<P>(callbackfn: (index: number, column: ITidyBaseColumn<T>) => P | undefined, forceMapAllRows?: boolean): P[];


    /**
     * Map the rows that are visible given a hierarchical axis and an array of boolean values
     * @param expanded an array indicating for each index if it is expanded or not. If it is collapsed, then all
     * children are not visible.
     * @param fun function to apply
     */
    mapVisibleRows<P>(expanded: (rowIdx: number) => boolean, fun: (index: number) => P): P[];

    mapTreeVisibleRows<P extends ReactElement>(expanded: (rowIdx: number) => boolean, fun: (index: number) => P, filter?: (info: MdxInfo) => boolean): P[];

    /**
     * For hierarchical structures de tree depth, starts at zero.
     */
    getLevelDepth(idx: number): number;

    /**
     * Returns true if and only if the mdx member at rowIdx has children
     */
    hasMdxChildren(rowIdx: number): boolean;

    /**
     * Returns a string representation of the coordinate
     */
    getCoordinateUniqueName(rowIdx: number): TidyColumnCoordinateUniqueName;

    /**
     * Returns true if the column has a property of requested name.
     */
    hasProperty(name: ITidyColumnNamedProperties | string): boolean;

    /**
     * Returns the property at the specified property coordinate.
     * @param name name of the property.
     */
    getProperty(name: ITidyColumnNamedProperties | string): ITidyUnknownColumn;

    /**
     * Returns the property at the specified property coordinate.
     * @param name name of the property.
     */
    getOptionalProperty(name: ITidyColumnNamedProperties | string): ITidyUnknownColumn | undefined;

    /**
     * Get the value of the property for the given property coordinate and the given row (undefined if the property does not exist)
     * @param name name of the property.
     * @param rowIdx row index for the value to return.
     */
    getPropertyAt(name: ITidyColumnNamedProperties | string, rowIdx: number): any;

    /**
     * Returns true if the column has color property or is a color column
     */
    hasColorProperty(): boolean;

    /**
     * Returns the color column (if defined).
     *
     * If the column has type 'color', then it returns itself. Else it returns the
     * column of the first property with type 'color'.
     */
    getColorColumn(): ITidyColorColumn | undefined;

    /**
     * Returns the color of a cell (if defined).
     *
     * If the column has type 'color', then it returns the cell value. Else it returns the
     * value at rowIdx of the first property with type 'color' (if it is defined).
     */
    getColor(rowIdx: number): Property.Color | undefined;

    /**
     * Return available properties for this column as a list of columns.
     */
    getProperties(): ITidyUnknownColumn[];

    /**
     * Return the properties for the column as a table.
     */
    getPropertyTable(): ITidyTable;

    /**
     * Set a table as the properties for this column. Ensure that the row count of the table is equal to the length
     * of the column.
     * @param tableWithProperties table with columns that will become properties of the column.
     */
    setPropertyTable(tableWithProperties: ITidyTable): void;

    /**
     * Return the properties of a column for a given cell index.
     * @param idx row index of cell.
     */
    getPropertiesAt(idx: number): Record<string, any>;

    /**
     * For each row matching the lookup value call func()
     *
     * @param lookupValue
     * @param func  if false, stop the foreach
     */
    forEachMatching(lookupValue: any, func: (rowIdx: number) => void | boolean): void;

    /**
     * Set a property on the column. If the property already exists, it is overwritten.
     * @param property the column to set as a property. Ensure that the lengths are the same.
     */
    setProperty(property: ITidyColumn): void;

    /**
     * Delete a property on the column
     */
    deleteProperty(propertyName: string): void;

    /**
     * Returns first value where callback does not return undefined.
     * @param callback given the row index, outputs a value or undefined.
     */
    findFirst<P>(callback: (idx: number) => P | undefined): P | undefined;

    /**
     * @param column the initial selection as a column
     * @param items the initial selection (name, ...)
     */
    getInitialSelectionRowIndices(column: ITidyColumn | undefined, items: any[]): number[];

    /**
     * The ITidyTableSelection row identifier for the row (uniqueName if it's an MDX like column)
     */
    getSelectionRowIdentifier(idx: number): string;

    /**
     * @param sel  the selection columns
     * @param colIdx  if multiple columns, the colIdx in the selectionColumn for the lookup
     * @param startIdx  if defined, start lookup at this position
     */
    findRowIdxForSelection(sel: ITidyTableSelection, colIdx?: number, startIdx?: number): number | undefined;

    /**
     * If an error occurred in the calculation of cells for a column, then the error can be
     * retrieved using this function.
     * @param idx the row index of the cell to retrieve the error of.
     */
    getError(idx: number): TidyCellError | undefined;

    /**
     * Set the errors of the column, where error[i] = the error for the column cell at idx i, for i = 0, ..., N-1.
     */
    setErrors(errors: (TidyCellError | undefined)[]): void;

    /**
     * Returns the row index of the first occurrence where the values of this column equals value. Returns undefined
     * if it did not find the value.
     * @param value value to search for.
     */
    getRowIndexOf(value: T): number | undefined;


    /**
     * Apply a function to the groups of unique values in this column
     */
    groupBy(): Map<T, number[]>;

    /**
     * Get the default member of the dimension that the column represents. Returns undefined
     * if the column is not a MDX dimension.
     */
    getHierarchyDefaultMember(): EntityItem | undefined;

    /**
     * Get extra information of the MDX axis used for this column, if available.
     */
    getAxisInfo(): IMdxAxisSeriesInfo | undefined;

    /**
     * Get the MDX axis coordinate, if available.
     * @see {AxisCoordinate}
     */
    getAxisCoordinate(): AxisCoordinate | undefined;

    /**
     * For a hierarchical columns returns a a list of transformed colummns  columns as needed by a pivot
     * table like structure
     *
     * (e.g.  a columns with Year, Quarter and Month will be converteded into 3 columns [Year,Quarter,Month])
     *
     * .. still experimental
     *
     * If not, hierarchical, return this
     */
    toFlatColumns(nullValue: any): ITidyUnknownColumn[];

    /**
     * Returns the tree-path for the node, including the node itself.
     * @param rowIdx column index of the node.
     */
    getNodePath(rowIdx: number): number[];

    /**
     * Returns if present a notification as defined by the properties of the columns
     */
    getAppNotification(rowIdx: number): AppNotification | undefined;

    /**
     * Returns if present an action as defined by the properties of the columns
     */
    getEventAction(rowIdx: number): [string, TidyActionEvent] | undefined;

    /**
     * Insert a column into this column.
     * @param column column to add.
     * @param index insert the column at this index. If undefined, insert at the start of the
     * this column.
     */
    insertColumn(column: ITidyColumn, index?: number): void;

    mapUniqueNames<T>(uniqueNames: string[], mapper: (idx: number) => T | null | undefined): T[];

    /**
     * Apply a new index to the column and its properties.
     *
     * Examples:
     * column.getValues() --> ['a','b','c']
     * column.reIndex([2,1,0]) --> ['c','b','a']
     * column.reIndex([2,2,1]) --> ['c','c','b']
     * column.reIndex([0]) --> ['a']
     * column.reIndex([0,5]) --> ['a',undefined]
     *
     * @param index list of integers.
     * @param keepingAxisOrder
     */
    reIndex(index: number[], keepingAxisOrder?: boolean): void;

    /**
     * Subset the data in a column returning a new column
     * @param index the row indices to include in the new column
     */
    subset(index: number[]): ITidyBaseColumn<T>;

    /**
     * Repeat the values in the column.
     *
     * Examples:
     * column.getValues() --> ['a','b','c']
     * column.repeat(6,1) --> ['a','b','c','a','b','c']
     * column.repeat(6,2) --> ['a','a','b','b','c','c']
     * column.repeat(12,2) --> ['a','a','b','b','c','c','a','a','b','b','c','c']
     *
     * @param newLength new length of the array.
     * @param repetition how many times to repeat each value.
     */
    repeat(newLength: number, repetition?: number): void;

    /**
     * Function used for value comparison in sorting and ranking. Return a positive number if a > b, a negative
     * number if a < b and 0 otherwise.
     * @param a value 1
     * @param b value 2
     */
    compare(a: T, b: T): number;

    /**
     * Check if column is of type
     * @param type check this type
     */
    is<T extends TidyColumnsType>(type: T): this is ITidyColumnIsType<T>;

    /**
     * Returns true if and only if the column is of the type(s) specified
     * @param typesToCheck one or more types to check this column against
     */
    isOfType(...typesToCheck: TidyColumnsType[]): boolean;

    /**
     * Convert the column to another type. This modifies the values to be of that type.
     *
     * If type is datetime, then the settings contain the date locale (default='en_US') and
     * the dateformat (default = 'yyyy-MM-dd').
     */
    convertToType(type: TidyColumnsType, settings?: { locale?: string, dateFormat?: string }): void;

    /**
     * Change the type of the column. Note, only types that model the values in the column are allowed. For conversion,
     * use {@link convertToType}
     * @param type
     */
    setType(type: AllowedColumnType<T>): void;

    /**
     * Return the type of the column
     */
    getType(): AllowedColumnType<T>;

    /**
     * Cell decoration
     */
    setCellDecoration(decoration: PublicTidyColumnCellDecoration): void;

    /**
     * Return the celldecoration of the column
     */
    getCellDecoration(): PublicTidyColumnCellDecoration;

    /**
     * Set a value in the cache of the column.
     */
    setCachedValue(key: string, value: any): void;

    /**
     * Get a value from the columns cache.
     */
    getCachedValue(key: string): any;

    /**
     * Clear the columns cache.
     */
    clearCache(): void;

    /**
     * Returns the type for Material-UI Table/Grid
     */
    getXGridType(): "string" | "number" | "date" | "dateTime" | "boolean" | undefined;

    /**
     * Get the display name of the column. Both the name and the caption form the display name of the column.
     */
    getDisplayName(): string;

    /**
     * Get the MDX role of the column
     */
    getRole(): string | undefined;

    /**
     * Set the role of the column.
     * @param role
     */
    setRole(role: string | undefined): void;
}

export type PublicTidyColumnCellDecoration = Partial<{

    handlesCellsOnError: boolean;

    appliesToCell: (rowIdx: number) => boolean;

    rendered: (rowIdx: number) => React.ReactElement;

    cssStyles: (rowIdx: number) => Record<string, any> | undefined;
}>;

export type ITidyColumn = ITidyBaseColumn<any>;
export type ITidyUnknownColumn = ITidyBaseColumn<unknown>;
export type ITidyNullColumn = ITidyBaseColumn<null>;
export type ITidyNumericColumn = ITidyBaseColumn<number | null>;
export type ITidyCharacterColumn = ITidyBaseColumn<string | null>;
export type ITidyColorColumn = ITidyBaseColumn<Property.Color | null>;
export type ITidyDateColumn = ITidyBaseColumn<Date | null>;
export type ITidyLogicalColumn = ITidyBaseColumn<boolean | null>;
export type ITidyListColumn = ITidyBaseColumn<any[] | null>;

export type ITidyColumnIsType<T extends TidyColumnsType> =
    T extends TidyColumnsType.ANY ? ITidyColumn :
        T extends TidyColumnsType.COLOR ? ITidyColorColumn :
            T extends TidyColumnsType.LONGITUDE ? ITidyBaseColumn<number> :
                T extends TidyColumnsType.LATITUDE ? ITidyBaseColumn<number> :
                    T extends TidyColumnsType.ISO2_LOCATION_CODE ? ITidyCharacterColumn :
                        T extends TidyColumnsType.DATETIME ? ITidyDateColumn :
                            T extends TidyColumnsType.NUMERIC ? ITidyNumericColumn :
                                T extends TidyColumnsType.CHARACTER ? ITidyCharacterColumn :
                                    T extends TidyColumnsType.LOGICAL ? ITidyLogicalColumn :
                                        T extends TidyColumnsType.LIST ? ITidyListColumn :
                                            T extends TidyColumnsType.MIXED ? ITidyColumn :
                                                T extends TidyColumnsType.NULL ? ITidyNullColumn :
                                                    ITidyUnknownColumn;

/**
 * Introduced for tidy table HTML expression (e.g., tooltip) completion.
 *
 * Quite simple for now: caption (as shown in the completion) to the actual Javascript method.
 */
export interface TidyTableExprColumnMeta {

    caption: string;

    method: string;
    argRow?: boolean;

}

export const TidyTableTextExprColumnMetas: TidyTableExprColumnMeta[] = [

    {caption: "total", method: "sum"},
    {caption: "average", method: "mean"},
    {caption: "median", method: "median"},
    {caption: "min", method: "min"},
    {caption: "max", method: "max"},
    {caption: "variance", method: "variance"},
    {caption: "standardDeviation", method: "standardDeviation"},
    {caption: "count", method: "count"},

    {caption: "percent", method: "percent", argRow: true},

    {caption: "caption", method: "getCaption"},

];

export const TidyTableNumberExprColumnMetas: TidyTableExprColumnMeta[] = [

    {caption: "total", method: "sum"},
    {caption: "average", method: "mean"},
    {caption: "median", method: "median"},
    {caption: "min", method: "min"},
    {caption: "max", method: "max"},
    {caption: "variance", method: "variance"},
    {caption: "standardDeviation", method: "standardDeviation"},
    {caption: "count", method: "count"},

    {caption: "percent", method: "percent", argRow: true},

    // {caption: "caption", method: "getCaption"},

];