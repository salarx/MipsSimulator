# ![alt text](https://raw.githubusercontent.com/salarx/mipsSimulator/master/images/favicon.ico "MIPS Simulator!") MIPS Simulator 
A simple MIPS pipeline CPU simulator demonstrating the effects of different instructions
on clock cycles, registers, and memory. Step through to view effects closer or execute all instructions
to see the final results. 

## Input File Format

### Setting Initial Values of Registers
This section is began with the word "registers" (not case sensitive).
To set a register, specifiy the register as "r1" or "1" followed by a space
then put the value as a base 10 integer. Each register needs to be separated 
by a new line. 

Registers span from register 0 to register 31 with register 0 being 
permanently set to the value 0.

Example:   
REGISTERS  
R1 15  
30 1234  

### Setting Initial Values of Memory
This section is began with the word "memory" (not case sensitive).
To set a memory location with value, specify the memory location as 
"m1" or "1" followed by a space then put the value as a base 10 integer.
Each memory location needs to be separated by a new line. 

Memory locations need to be positive and divisible by 4.

Example:  
MEMORY  
M4 100  
16 255  

### Code Section
This section is began with the word "code" (not case sensitive).
Each line of this section needs to be a 32 - bit MIPS instruction that is 
supported by the program.

Each line of code can be separated with a number of spaces. 

Example:   
CODE  
0000 0000 1110 0101 0101 1000 0010 0000  
00100000 1010 10100000 0001 10101010  
00000001010101010101100000100010  

## Supported MIPS Instructions

### ADD - add (with overflow)
add rd, rs, rt  
rd = rs + rt  
0000 00ss ssst tttt dddd d000 0010 0000

### ADDI - add immediate (with overflow)
addi rs, rt, imm  
rt = rs + imm  
0010 00ss ssst tttt iiii iiii iiii iiii

### SUB - subtract
sub rd, rs, rt  
rd = rs - rt  
0000 00ss ssst tttt dddd d000 0010 0010

### SLT - set on less than (signed)
slt rd, rs, rt  
if(rs < rt) rd = 1 else rd = 0  
0000 00ss ssst tttt dddd d000 0010 1010 

### LW - load word
lw rt, offset(rs)  
rt = &ast;(int&ast;)(offset+rs)  
1000 11ss ssst tttt iiii iiii iiii iiii

### SW - store word
sw rt, offset(rs)  
&ast;(int&ast;)(offset+rs) = rt  
1010 11ss ssst tttt iiii iiii iiii iiii

### BEQ - branch on equal
beq rs, rt, offset  
if(rs == rt) pc += offset * 4  
0001 00ss ssst tttt iiii iiii iiii iiii

### BNE - branch on not equal
bne rs, rt, offset  
if(rs != rt) pc += offset * 4  
0001 01ss ssst tttt iiii iiii iiii iiii  

