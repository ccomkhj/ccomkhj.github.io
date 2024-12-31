---
layout: single
author: Huijo
date: 2024-12-28
tags:
   - Programing
classes: wide
title: Data Science in Elixir
---

## Transitioning from Python to Elixir in Data Science
Data processing is often dominated by Python and libraries like pandas and spark. However, Elixir is emerging as a strong contender. By using Elixir throughout your application stack including the data processing, you enhance code reusability and maintainability. This blog post explores how to leverage Elixir's capabilities for data frame manipulations traditionally performed in Python, showcasing its benefits in data-intensive production scenarios.

Implementation code available [here](https://github.com/ccomkhj/elixir_python)

### Setup

```elixir
Mix.install(
  [
    {:kino_explorer, "~> 0.1.20"},
    {:explorer, "~> 0.10.0"},
    {:httpoison, "~> 1.8"},
    {:jason, "~> 1.4"},
    {:vega_lite, "~> 0.1.7"},
    {:exla, ">= 0.0.0"},
    {:kino_vega_lite, "~> 0.1.11"}
  ],
  config: [nx: [default_backend: EXLA.Backend]]
)
```

### Basic DataFrame Manipulation

Let's dive into a simple data manipulation task. In Python, you might double the values in a column with `df["feature"] = df["feature"] * 2`. Here's how we achieve the same in Elixir:

```elixir
alias Explorer.DataFrame
alias Explorer.Series

# Ensure all macros and functions in Explorer.DataFrame are available
require DataFrame

# Sample data frame creation
data = %{
  feature: [1, 2, 3, 4, 5]
}

# Creating the DataFrame
df = DataFrame.new(data)

# Accessing the "feature" column and doubling its values
# feature_series = DataFrame.pull(df, "feature")
# doubled_feature = Series.multiply(feature_series, 2)

# Simpler style in elixir, but equivalent to the above
doubled_feature = DataFrame.pull(df, "feature") 
  |> Series.multiply(2)


# Creating a new DataFrame with the updated values
df = DataFrame.put(df, "feature", doubled_feature)

df
```

<!-- livebook:{"output":true} -->

```text
#Explorer.DataFrame<
  Polars[5 x 1]
  feature s64 [2, 4, 6, 8, 10]
>
```

### Advanced Data Processing

Handling missing values is a common data science task. 
i.e. `s.interpolate(method='linear')` in python.
Let's perform **linear interpolation**, a bit more involved in Elixir:

```elixir
defmodule DataFrameProcessor do
  require Logger
  alias Explorer.DataFrame
  alias Explorer.Series

  # Define a function to interpolate values in a Series
  def interpolate(series) do
    values = Series.to_list(series)
    Logger.info("Original series: #{inspect(values)}")

    interpolated = Enum.reduce_while(values, [], fn value, acc ->
      Logger.info("Current value: #{inspect(value)}, Accumulated: #{inspect(acc)}")

      case value do
        nil ->
          last_value = List.last(acc) || 0.0
          index = length(acc)

          Logger.info("Interpolating. Last known: #{inspect(last_value)}, Index: #{inspect(index)}")

          rest = Enum.drop(values, index + 1)
          next_value = Enum.find(rest, fn x -> not is_nil(x) end)

          interpolated_value =
            if not is_nil(next_value) do
              (last_value + next_value) / 2
            else
              last_value
            end

          Logger.info("Interpolated value: #{inspect(interpolated_value)}")

          {:cont, acc ++ [interpolated_value]}

        _ ->
          {:cont, acc ++ [value]}
      end
    end)

    Logger.info("Interpolated series: #{inspect(interpolated)}")
    Series.from_list(interpolated)
  end

  def process_and_join(date_list, feature1, feature2) do
    data_df1 = %{
      "feature1" => feature1,
      "date" => date_list
    }

    data_df2 = %{
      "feature2" => feature2,
      "date" => date_list
    }

    df1 = DataFrame.new(data_df1)
    df2 = DataFrame.new(data_df2)

    Logger.info("Initial DataFrame df1: #{inspect(df1)}")
    Logger.info("Initial DataFrame df2: #{inspect(df2)}")

    df1 = DataFrame.put(df1, "feature1", interpolate(DataFrame.pull(df1, "feature1")))
    df2 = DataFrame.put(df2, "feature2", interpolate(DataFrame.pull(df2, "feature2")))

    Logger.info("DataFrame df1 after interpolation: #{inspect(df1)}")
    Logger.info("DataFrame df2 after interpolation: #{inspect(df2)}")

    joined_df = DataFrame.join(df1, df2, on: "date", how: :left)

    Logger.info("Joined DataFrame: #{inspect(joined_df)}")
    joined_df
  end
end

# Sample data for testing
date_list = [
  ~D[2023-01-01],
  ~D[2023-01-02],
  ~D[2023-01-03],
  ~D[2023-01-04],
  ~D[2023-01-05]
]

feature1 = [1.0, nil, 3.0, nil, 5.0]
feature2 = [nil, 8.0, nil, 16.0, 20.0]

# Execute the processor with sample data
DataFrameProcessor.process_and_join(date_list, feature1, feature2)
```

```

20:37:16.589 [info] Initial DataFrame df1: #Explorer.DataFrame<
  Polars[5 x 2]
  date date [2023-01-01, 2023-01-02, 2023-01-03, 2023-01-04, 2023-01-05]
  feature1 f64 [1.0, nil, 3.0, nil, 5.0]
>

20:37:16.589 [info] Initial DataFrame df2: #Explorer.DataFrame<
  Polars[5 x 2]
  date date [2023-01-01, 2023-01-02, 2023-01-03, 2023-01-04, 2023-01-05]
  feature2 f64 [nil, 8.0, nil, 16.0, 20.0]
>

20:37:16.589 [info] Original series: [1.0, nil, 3.0, nil, 5.0]

20:37:16.589 [info] Current value: 1.0, Accumulated: []

20:37:16.590 [info] Current value: nil, Accumulated: [1.0]

20:37:16.590 [info] Interpolating. Last known: 1.0, Index: 1

20:37:16.590 [info] Interpolated value: 2.0

20:37:16.590 [info] Current value: 3.0, Accumulated: [1.0, 2.0]

20:37:16.590 [info] Current value: nil, Accumulated: [1.0, 2.0, 3.0]

20:37:16.590 [info] Interpolating. Last known: 3.0, Index: 3

20:37:16.590 [info] Interpolated value: 4.0

20:37:16.590 [info] Current value: 5.0, Accumulated: [1.0, 2.0, 3.0, 4.0]

20:37:16.590 [info] Interpolated series: [1.0, 2.0, 3.0, 4.0, 5.0]

20:37:16.591 [info] Original series: [nil, 8.0, nil, 16.0, 20.0]

20:37:16.591 [info] Current value: nil, Accumulated: []

20:37:16.591 [info] Interpolating. Last known: 0.0, Index: 0

20:37:16.591 [info] Interpolated value: 4.0

20:37:16.591 [info] Current value: 8.0, Accumulated: [4.0]

20:37:16.591 [info] Current value: nil, Accumulated: [4.0, 8.0]

20:37:16.591 [info] Interpolating. Last known: 8.0, Index: 2

20:37:16.591 [info] Interpolated value: 12.0

20:37:16.591 [info] Current value: 16.0, Accumulated: [4.0, 8.0, 12.0]

20:37:16.592 [info] Current value: 20.0, Accumulated: [4.0, 8.0, 12.0, 16.0]

20:37:16.592 [info] Interpolated series: [4.0, 8.0, 12.0, 16.0, 20.0]

20:37:16.593 [info] DataFrame df1 after interpolation: #Explorer.DataFrame<
  Polars[5 x 2]
  date date [2023-01-01, 2023-01-02, 2023-01-03, 2023-01-04, 2023-01-05]
  feature1 f64 [1.0, 2.0, 3.0, 4.0, 5.0]
>

20:37:16.593 [info] DataFrame df2 after interpolation: #Explorer.DataFrame<
  Polars[5 x 2]
  date date [2023-01-01, 2023-01-02, 2023-01-03, 2023-01-04, 2023-01-05]
  feature2 f64 [4.0, 8.0, 12.0, 16.0, 20.0]
>

20:37:16.594 [info] Joined DataFrame: #Explorer.DataFrame<
  Polars[5 x 3]
  date date [2023-01-01, 2023-01-02, 2023-01-03, 2023-01-04, 2023-01-05]
  feature1 f64 [1.0, 2.0, 3.0, 4.0, 5.0]
  feature2 f64 [4.0, 8.0, 12.0, 16.0, 20.0]
>

```

```text
#Explorer.DataFrame<
  Polars[5 x 3]
  date date [2023-01-01, 2023-01-02, 2023-01-03, 2023-01-04, 2023-01-05]
  feature1 f64 [1.0, 2.0, 3.0, 4.0, 5.0]
  feature2 f64 [4.0, 8.0, 12.0, 16.0, 20.0]
>
```

Calculating Moving Averages
Moving averages offer insights into data trends.

In python/pandas, again one liner,
`df['feature'].rolling(3).mean()`.

Thankfully, there's some support in Series in Elixir. Check this [link](https://hexdocs.pm/explorer/Explorer.Series.html#window_mean/3).
Here’s how to calculate them in Elixir:

```elixir
defmodule TemperatureAnalysis do
  alias Explorer.DataFrame
  alias Explorer.Series

  def moving_average(date_list, temperature_list, window_size, weights \\ []) do
    # Create a dataframe with date and temperature
    data = %{
      "date" => date_list,
      "temperature" => temperature_list
    }
    df = DataFrame.new(data)

    # Pull the temperature series and calculate the moving average with the provided weights
    temperature_series = DataFrame.pull(df, "temperature")
    
    # Calculate the moving average using the provided weights
    # If the weights are not provided, equal weighting is assumed
    moving_avg_series =
      Series.window_mean(temperature_series, window_size, weights: weights, min_periods: 1)
    
    # Add the moving_average column back to the dataframe
    df_with_moving_avg = DataFrame.put(df, "moving_average", moving_avg_series)

    # Log or return the DataFrame with the moving average
    IO.inspect(df_with_moving_avg, label: "DataFrame with Moving Average")
    df_with_moving_avg
  end
end

defmodule DateGenerator do
  # Function to generate a list of dates from a start date to a specified number of days
  def generate_dates(start_date, days) do
    Enum.map(0..(days-1), fn offset -> Date.add(start_date, offset) end)
  end
end

# Sample Input
date_list = DateGenerator.generate_dates(~D[2023-01-01], 21)

# Generate dynamic temperature values using a sinusoidal function with noise
temperature_list = Enum.map(1..21, fn day ->
  10.0 * :math.sin(day / 2) + Enum.random(-2..2) + 20
end)

window_size = 3

# Execute the moving average calculation
temperature = TemperatureAnalysis.moving_average(date_list, temperature_list, window_size, nil)
```

```
DataFrame with Moving Average: #Explorer.DataFrame<
  Polars[21 x 3]
  date date [2023-01-01, 2023-01-02, 2023-01-03, 2023-01-04, 2023-01-05, ...]
  temperature f64 [25.794255386042032, 30.414709848078964, 28.974949866040546,
   31.092974268256818, 26.984721441039564, ...]
  moving_average f64 [25.794255386042032, 28.104482617060498,
   28.394638366720514, 30.160877994125443, 29.017548525112307, ...]
>
```

```text
#Explorer.DataFrame<
  Polars[21 x 3]
  date date [2023-01-01, 2023-01-02, 2023-01-03, 2023-01-04, 2023-01-05, ...]
  temperature f64 [25.794255386042032, 30.414709848078964, 28.974949866040546, 31.092974268256818, 26.984721441039564, ...]
  moving_average f64 [25.794255386042032, 28.104482617060498, 28.394638366720514, 30.160877994125443, 29.017548525112307, ...]
>
```

Visualization is apparently week compared to python. 
But it provides the basics.

`df.plot()`


```elixir
VegaLite.new(width: 1080, title: "case study")
|> VegaLite.data_from_values(temperature, only: ["date", "moving_average", "temperature"])
|> VegaLite.layers([
  VegaLite.new()
  |> VegaLite.mark(:line)
  |> VegaLite.encode_field(:x, "date", type: :temporal)
  |> VegaLite.encode_field(:y, "moving_average", type: :quantitative),
  VegaLite.new()
  |> VegaLite.mark(:point)
  |> VegaLite.encode_field(:x, "date", type: :temporal)
  |> VegaLite.encode_field(:y, "temperature", type: :quantitative)
])
```