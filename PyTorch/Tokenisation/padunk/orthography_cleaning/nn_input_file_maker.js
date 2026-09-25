#!/usr/bin/node

const fs = require('node:fs');
const readline = require('readline');

class CsvReader {

    constructor(separator=",") {
        this.m_separator = separator;
    }

    setHeaders(first_line) {
        this.m_header_index_map.clear();
        const headers_arr = first_line.split(this.m_separator);
        for(const header_idx in headers_arr) {
            this.m_header_index_map.set(headers_arr[header_idx], header_idx);
        }
    }

    setLine(line) {
        this.m_raw_line = line;
        this.m_fields_array = this.m_raw_line.split(this.m_separator);
    }

    getField(header) {
        return this.m_fields_array[this.m_header_index_map.get(header)];
    }

    setField(header, new_value) {
        if(this.m_header_index_map.has(header)) {
            this.m_fields_array[this.m_header_index_map.get(header)] = new_value;
            this.m_raw_line = this.m_fields_array.join(m_separator);
        }
        else {
            console.log("CsvReader.setField() failed because the header-value is wrong");
        }
    }

    getRawLine(){
        return this.m_raw_line;
    }

    getFieldsArray() {
        return this.m_fields_array;
    }

    m_header_index_map = new Map();
    m_raw_line = "";
    m_fields_array = new Array();
    m_separator = "";
};
